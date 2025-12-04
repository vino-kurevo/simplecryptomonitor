import fetch from 'node-fetch';
import { supabase } from '../utils/supabase.js';
import { config } from '../utils/config.js';
import { Event, NotificationChannel, Wallet } from '../types/index.js';

async function sendTelegram(chatId: string, message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('[TELEGRAM] Send failed:', error);
    return false;
  }
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`[EMAIL] Would send to ${to}: ${subject}`);
  return true;
}

function formatNotificationMessage(event: Event, wallet: Wallet): string {
  const explorerUrls: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${event.tx_hash}`,
    tron: `https://tronscan.org/#/transaction/${event.tx_hash}`,
    bsc: `https://bscscan.com/tx/${event.tx_hash}`,
  };

  const networkNames: Record<string, string> = {
    ethereum: 'Ethereum (ERC20)',
    tron: 'Tron (TRC20)',
    bsc: 'BSC (BEP20)',
  };

  const direction = event.direction.charAt(0).toUpperCase() + event.direction.slice(1);

  return `[${event.token}] Transaction on ${networkNames[event.network]}
Network: ${networkNames[event.network]}
Wallet: ${wallet.label || wallet.address}
Direction: ${direction}
Amount: ${event.amount.toFixed(2)} ${event.token}
Tx: ${explorerUrls[event.network]}`;
}

async function processNotifications() {
  const { data: events } = await supabase
    .from('events')
    .select(
      `
      *,
      wallets(*)
    `
    )
    .eq('notified', false)
    .limit(50);

  if (!events || events.length === 0) {
    return;
  }

  for (const event of events as Array<Event & { wallets: Wallet }>) {
    try {
      const wallet = event.wallets;

      const { data: channels } = await supabase
        .from('notification_channels')
        .select()
        .eq('user_id', wallet.user_id)
        .eq('is_enabled', true)
        .eq('verified', true);

      if (!channels || channels.length === 0) {
        await supabase.from('events').update({ notified: true }).eq('id', event.id);
        continue;
      }

      const message = formatNotificationMessage(event, wallet);

      for (const channel of channels as NotificationChannel[]) {
        let success = false;
        let errorMessage = '';

        try {
          if (channel.type === 'telegram' && channel.config.chat_id) {
            success = await sendTelegram(channel.config.chat_id, message);
          } else if (channel.type === 'email' && channel.config.email) {
            success = await sendEmail(
              channel.config.email,
              `Crypto Alert: ${event.direction} ${event.amount} ${event.token}`,
              message
            );
          }
        } catch (error) {
          errorMessage = String(error);
          success = false;
        }

        await supabase.from('notifications').insert({
          event_id: event.id,
          channel_id: channel.id,
          status: success ? 'sent' : 'failed',
          error_message: errorMessage || null,
          sent_at: success ? new Date().toISOString() : null,
        });

        if (success) {
          console.log(
            `[DISPATCH] ${channel.type} notification sent for event ${event.id} (${event.direction} ${event.amount} ${event.token})`
          );
        }
      }

      await supabase.from('events').update({ notified: true }).eq('id', event.id);
    } catch (error) {
      console.error(`[ERROR] Processing event ${event.id}:`, error);
    }
  }
}

async function main() {
  console.log('[DISPATCHER] Worker started');

  while (true) {
    try {
      await processNotifications();
    } catch (error) {
      console.error('[ERROR] Main loop:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();
