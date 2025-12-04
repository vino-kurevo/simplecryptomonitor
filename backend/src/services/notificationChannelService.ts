import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';
import { PLAN_LIMITS } from '../types/index.js';

export const notificationChannelService = {
  async getChannels(userId: string) {
    const { data, error } = await supabase.from('notification_channels').select().eq('user_id', userId);

    if (error) {
      throw new AppError('FETCH_FAILED', error.message, 500);
    }

    return data || [];
  },

  async createChannel(userId: string, type: string, config: any) {
    const { data: user } = await supabase.from('users').select('current_plan').eq('id', userId).maybeSingle();

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const { count } = await supabase
      .from('notification_channels')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const limits = PLAN_LIMITS[user.current_plan as keyof typeof PLAN_LIMITS];
    if (count !== null && count >= limits.channels) {
      throw new AppError('LIMIT_EXCEEDED', `Plan limit: ${limits.channels} channels`, 403);
    }

    if (!limits.channel_types.includes(type as any)) {
      throw new AppError('CHANNEL_NOT_ALLOWED', `Channel type ${type} not allowed on ${user.current_plan} plan`, 403);
    }

    const { data, error } = await supabase
      .from('notification_channels')
      .insert({
        user_id: userId,
        type,
        config,
        is_enabled: true,
        verified: type === 'email',
      })
      .select()
      .single();

    if (error) {
      throw new AppError('CREATE_FAILED', error.message, 500);
    }

    return data;
  },

  async updateChannel(channelId: string, userId: string, updates: { config?: any; is_enabled?: boolean }) {
    const { data, error } = await supabase
      .from('notification_channels')
      .update(updates)
      .eq('id', channelId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      throw new AppError('UPDATE_FAILED', error.message, 500);
    }

    if (!data) {
      throw new AppError('CHANNEL_NOT_FOUND', 'Channel not found', 404);
    }

    return data;
  },

  async deleteChannel(channelId: string, userId: string) {
    const { error } = await supabase.from('notification_channels').delete().eq('id', channelId).eq('user_id', userId);

    if (error) {
      throw new AppError('DELETE_FAILED', error.message, 500);
    }
  },
};
