// src/services/authService.ts
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

class AuthService {
  // Регистрация
  static async register(userData) {
    try {
      // 1. Проверяем, нет ли уже такого пользователя
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${userData.email},username.eq.${userData.username}`)
        .single();

      if (existingUser) {
        throw new Error('Пользователь с таким email или именем уже существует');
      }

      // 2. Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      // 3. Создаём пользователя
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          email: userData.email,
          password_hash: passwordHash,
          avatar_url: userData.avatarUrl || '/images/default-avatar.png'
        }])
        .select()
        .single();

      if (error) throw error;

      // 4. Сохраняем в localStorage (сессия)
      localStorage.setItem('user', JSON.stringify({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar_url: newUser.avatar_url
      }));

      return {
        success: true,
        user: newUser
      };

    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Вход
  static async login(email, password) {
    try {
      // 1. Ищем пользователя
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw new Error('Неверный email или пароль');
      }

      // 2. Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Неверный email или пароль');
      }

      // 3. Сохраняем сессию
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }));

      return {
        success: true,
        user: user
      };

    } catch (error) {
      console.error('Ошибка входа:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Выход
  static logout() {
    localStorage.removeItem('user');
    return { success: true };
  }

  // Проверка авторизации
  static getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

  // Проверка, залогинен ли пользователь
  static isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export default AuthService;