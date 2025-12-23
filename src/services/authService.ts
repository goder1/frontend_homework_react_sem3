// src/services/authService.ts
// @ts-ignore
import { supabase } from '../lib/supabaseClient';

class AuthService {
  // Регистрация
  static async register(userData: { email: string; password: string; username: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          username: userData.username,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Вход
  static async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Получаем профиль
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: profile?.username || email.split('@')[0],
          avatar_url: profile?.avatar_url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Выход
  static async logout() {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message };
  }

  // Получение текущего пользователя
  static async getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    return {
      id: data.session.user.id,
      email: data.session.user.email,
      username: profile?.username || data.session.user.email?.split('@')[0],
      avatar_url: profile?.avatar_url,
    };
  }

  // Проверка авторизации
  static async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  }
}

export default AuthService;
