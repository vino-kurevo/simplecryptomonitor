import { supabase } from '../utils/supabase.js';
import { AppError } from '../utils/errors.js';

export const authService = {
  async register(email: string, password: string, fullName?: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new AppError('REGISTRATION_FAILED', authError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('REGISTRATION_FAILED', 'User creation failed', 500);
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      current_plan: 'free',
    });

    if (profileError) {
      throw new AppError('PROFILE_CREATION_FAILED', profileError.message, 500);
    }

    await supabase.from('billing_subscriptions').insert({
      user_id: authData.user.id,
      plan: 'free',
      status: 'active',
    });

    return { user: authData.user, session: authData.session };
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('LOGIN_FAILED', error.message, 401);
    }

    return { user: data.user, session: data.session };
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase.from('users').select().eq('id', userId).maybeSingle();

    if (error || !data) {
      throw new AppError('USER_NOT_FOUND', 'Profile not found', 404);
    }

    return data;
  },

  async updateProfile(userId: string, updates: { full_name?: string }) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new AppError('UPDATE_FAILED', 'Profile update failed', 500);
    }

    return data;
  },
};
