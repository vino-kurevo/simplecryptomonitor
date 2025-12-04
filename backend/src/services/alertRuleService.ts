import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';

export const alertRuleService = {
  async getRulesForWallet(walletId: string, userId: string) {
    const { data: wallet } = await supabase.from('wallets').select().eq('id', walletId).eq('user_id', userId).maybeSingle();

    if (!wallet) {
      throw new AppError('WALLET_NOT_FOUND', 'Wallet not found', 404);
    }

    const { data, error } = await supabase.from('alert_rules').select().eq('wallet_id', walletId);

    if (error) {
      throw new AppError('FETCH_FAILED', error.message, 500);
    }

    return data || [];
  },
};
