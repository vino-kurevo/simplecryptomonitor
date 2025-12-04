import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';

export const eventService = {
  async getEventsForUser(userId: string, limit: number = 50, offset: number = 0) {
    const { data: wallets } = await supabase.from('wallets').select('id').eq('user_id', userId);

    if (!wallets || wallets.length === 0) {
      return [];
    }

    const walletIds = wallets.map((w) => w.id);

    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        wallets(network, address, label)
      `
      )
      .in('wallet_id', walletIds)
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('FETCH_FAILED', error.message, 500);
    }

    return data || [];
  },
};
