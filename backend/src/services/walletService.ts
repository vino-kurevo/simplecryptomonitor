import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';
import { PLAN_LIMITS } from '../types/index.js';

export const walletService = {
  async getWallets(userId: string) {
    const { data, error } = await supabase.from('wallets').select().eq('user_id', userId);

    if (error) {
      throw new AppError('FETCH_FAILED', error.message, 500);
    }

    return data || [];
  },

  async createWallet(userId: string, network: string, address: string, label?: string) {
    const { data: user } = await supabase.from('users').select('current_plan').eq('id', userId).maybeSingle();

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const { count } = await supabase.from('wallets').select('*', { count: 'exact', head: true }).eq('user_id', userId);

    const limit = PLAN_LIMITS[user.current_plan as keyof typeof PLAN_LIMITS].wallets;
    if (count !== null && count >= limit) {
      throw new AppError('LIMIT_EXCEEDED', `Plan limit: ${limit} wallets`, 403);
    }

    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        network,
        address: address.toLowerCase(),
        label,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new AppError('CREATE_FAILED', error.message, 500);
    }

    await supabase.from('alert_rules').insert({
      wallet_id: data.id,
      direction: 'both',
      is_active: true,
    });

    return data;
  },

  async updateWallet(walletId: string, userId: string, updates: { label?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', walletId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      throw new AppError('UPDATE_FAILED', error.message, 500);
    }

    if (!data) {
      throw new AppError('WALLET_NOT_FOUND', 'Wallet not found', 404);
    }

    return data;
  },

  async deleteWallet(walletId: string, userId: string) {
    const { error } = await supabase.from('wallets').delete().eq('id', walletId).eq('user_id', userId);

    if (error) {
      throw new AppError('DELETE_FAILED', error.message, 500);
    }
  },
};
