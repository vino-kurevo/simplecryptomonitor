import fetch from 'node-fetch';
import { supabase } from '../utils/supabase.js';
import { config } from '../utils/config.js';
import { Wallet, MonitoringState, AlertRule, Event } from '../types/index.js';

interface EthTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenDecimal: string;
  timeStamp: string;
}

interface TronTransfer {
  transaction_id: string;
  from_address: string;
  to_address: string;
  quant: string;
  block_ts: number;
}

async function fetchEthUsdtTransfers(address: string): Promise<EthTransfer[]> {
  try {
    const url = 'https://api.etherscan.io/v2/api';
    const params = new URLSearchParams({
      chainid: '1',
      module: 'account',
      action: 'tokentx',
      contractaddress: config.USDT_ERC20_CONTRACT,
      address: address,
      sort: 'asc',
      apikey: config.ETHERSCAN_API_KEY,
    });

    const response = await fetch(`${url}?${params}`);
    const data: any = await response.json();

    if (!data.result || typeof data.result === 'string') {
      console.error('[ETH] API error:', data);
      return [];
    }

    return data.result;
  } catch (error) {
    console.error('[ETH] Request failed:', error);
    return [];
  }
}

async function fetchTronUsdtTransfers(address: string): Promise<TronTransfer[]> {
  try {
    const url = 'https://apilist.tronscanapi.com/api/token_trc20/transfers';
    const params = new URLSearchParams({
      limit: '20',
      start: '0',
      contract_address: config.USDT_TRC20_CONTRACT,
      relatedAddress: address,
    });

    const response = await fetch(`${url}?${params}`);
    const data: any = await response.json();

    return data.token_transfers || [];
  } catch (error) {
    console.error('[TRON] Request failed:', error);
    return [];
  }
}

async function processEthereumWallet(wallet: Wallet, state: MonitoringState | null) {
  const transfers = await fetchEthUsdtTransfers(wallet.address);
  if (transfers.length === 0) return;

  transfers.sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));

  if (!state?.initialized) {
    const lastHash = transfers[transfers.length - 1].hash;
    await supabase.from('monitoring_state').upsert({
      wallet_id: wallet.id,
      network: 'ethereum',
      last_tx_hash: lastHash,
      initialized: true,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log(`[ETH] Initialized wallet ${wallet.id}`);
    return;
  }

  const newTransfers: EthTransfer[] = [];
  let found = !state.last_tx_hash;

  for (const tx of transfers) {
    if (!found) {
      if (tx.hash === state.last_tx_hash) {
        found = true;
      }
      continue;
    }
    newTransfers.push(tx);
  }

  const { data: rules } = await supabase
    .from('alert_rules')
    .select()
    .eq('wallet_id', wallet.id)
    .eq('is_active', true);

  for (const tx of newTransfers) {
    const fromAddr = tx.from.toLowerCase();
    const toAddr = tx.to.toLowerCase();
    const amount = parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
    const walletAddr = wallet.address.toLowerCase();

    let direction: 'incoming' | 'outgoing' | null = null;
    if (toAddr === walletAddr) direction = 'incoming';
    else if (fromAddr === walletAddr) direction = 'outgoing';

    if (!direction) continue;

    const shouldAlert = rules?.some((rule: AlertRule) => {
      if (!rule.is_active) return false;
      if (rule.direction !== 'both' && rule.direction !== direction) return false;
      if (rule.min_amount && amount < rule.min_amount) return false;
      return true;
    });

    if (shouldAlert) {
      await supabase.from('events').insert({
        wallet_id: wallet.id,
        tx_hash: tx.hash,
        direction,
        amount,
        token: 'USDT',
        network: 'ethereum',
        occurred_at: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        raw: tx,
        notified: false,
      });

      console.log(`[ETH] ${direction} ${amount.toFixed(2)} USDT on wallet ${wallet.id}`);
    }

    await supabase.from('monitoring_state').upsert({
      wallet_id: wallet.id,
      network: 'ethereum',
      last_tx_hash: tx.hash,
      initialized: true,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

async function processTronWallet(wallet: Wallet, state: MonitoringState | null) {
  const transfers = await fetchTronUsdtTransfers(wallet.address);
  if (transfers.length === 0) return;

  transfers.sort((a, b) => a.block_ts - b.block_ts);

  if (!state?.initialized) {
    const lastTxId = transfers[transfers.length - 1].transaction_id;
    await supabase.from('monitoring_state').upsert({
      wallet_id: wallet.id,
      network: 'tron',
      last_tx_hash: lastTxId,
      initialized: true,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    console.log(`[TRON] Initialized wallet ${wallet.id}`);
    return;
  }

  const newTransfers: TronTransfer[] = [];
  let found = !state.last_tx_hash;

  for (const tx of transfers) {
    if (!found) {
      if (tx.transaction_id === state.last_tx_hash) {
        found = true;
      }
      continue;
    }
    newTransfers.push(tx);
  }

  const { data: rules } = await supabase
    .from('alert_rules')
    .select()
    .eq('wallet_id', wallet.id)
    .eq('is_active', true);

  for (const tx of newTransfers) {
    const amount = parseInt(tx.quant) / 1e6;

    let direction: 'incoming' | 'outgoing' | null = null;
    if (tx.to_address === wallet.address) direction = 'incoming';
    else if (tx.from_address === wallet.address) direction = 'outgoing';

    if (!direction) continue;

    const shouldAlert = rules?.some((rule: AlertRule) => {
      if (!rule.is_active) return false;
      if (rule.direction !== 'both' && rule.direction !== direction) return false;
      if (rule.min_amount && amount < rule.min_amount) return false;
      return true;
    });

    if (shouldAlert) {
      await supabase.from('events').insert({
        wallet_id: wallet.id,
        tx_hash: tx.transaction_id,
        direction,
        amount,
        token: 'USDT',
        network: 'tron',
        occurred_at: new Date(tx.block_ts).toISOString(),
        raw: tx,
        notified: false,
      });

      console.log(`[TRON] ${direction} ${amount.toFixed(2)} USDT on wallet ${wallet.id}`);
    }

    await supabase.from('monitoring_state').upsert({
      wallet_id: wallet.id,
      network: 'tron',
      last_tx_hash: tx.transaction_id,
      initialized: true,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}

async function monitorWallets() {
  const { data: wallets } = await supabase.from('wallets').select().eq('is_active', true);

  if (!wallets || wallets.length === 0) {
    return;
  }

  for (const wallet of wallets as Wallet[]) {
    try {
      const { data: state } = await supabase
        .from('monitoring_state')
        .select()
        .eq('wallet_id', wallet.id)
        .eq('network', wallet.network)
        .maybeSingle();

      if (wallet.network === 'ethereum') {
        await processEthereumWallet(wallet, state);
      } else if (wallet.network === 'tron') {
        await processTronWallet(wallet, state);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[ERROR] Processing wallet ${wallet.id}:`, error);
    }
  }
}

async function main() {
  console.log('[MONITOR] Worker started');

  while (true) {
    try {
      await monitorWallets();
    } catch (error) {
      console.error('[ERROR] Main loop:', error);
    }

    await new Promise(resolve => setTimeout(resolve, config.POLLING_INTERVAL_MS));
  }
}

main();
