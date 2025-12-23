// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/user';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Моковые пользователи для демонстрации
const mockUsers: User[] = [
  {
    id: '1',
    username: 'CyberPlayer',
    email: 'player@example.com',
    avatarUrl: '/images/avatar.png',
    tag: '@gamer_pro',
    level: 42,
    gamesPlayed: 127,
    totalHours: 856,
    completionRate: 68,
    favoriteGenre: 'RPG',
    joinDate: '2022-01-15',
    isOnline: true,
  },
  {
    id: '2',
    username: 'GameMaster',
    email: 'master@example.com',
    avatarUrl: '/images/avatar2.png',
    tag: '@master_gamer',
    level: 78,
    gamesPlayed: 245,
    totalHours: 1520,
    completionRate: 82,
    favoriteGenre: 'Strategy',
    joinDate: '2021-03-20',
    isOnline: false,
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser: string | null = localStorage.getItem('user');

        if (token && savedUser) {
          const user: User = JSON.parse(savedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error: unknown) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Проверка учетных данных
      const user = mockUsers.find(u => u.email === credentials.email);

      if (!user) {
        throw new Error('Пользователь с таким email не найден');
      }

      // В реальном приложении здесь была бы проверка пароля
      const mockPassword = 'password123';
      if (credentials.password !== mockPassword) {
        throw new Error('Неверный пароль');
      }

      // Сохраняем в localStorage если запомнить
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', 'mock_jwt_token');
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('auth_token', 'mock_jwt_token');
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка входа',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Проверка паролей
      if (data.password !== data.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      // Проверка согласия с условиями
      if (!data.agreeToTerms) {
        throw new Error('Необходимо согласиться с условиями использования');
      }

      // Проверка уникальности email
      const emailExists = mockUsers.some(u => u.email === data.email);
      if (emailExists) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создание нового пользователя
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        username: data.username,
        email: data.email,
        avatarUrl: '/images/default-avatar.png',
        tag: `@${data.username.toLowerCase().replace(/\s+/g, '_')}`,
        level: 1,
        gamesPlayed: 0,
        totalHours: 0,
        completionRate: 0,
        favoriteGenre: 'Не выбран',
        joinDate: new Date().toISOString().split('T')[0],
        isOnline: true,
      };

      // Сохраняем в localStorage
      localStorage.setItem('auth_token', 'mock_jwt_token');
      localStorage.setItem('user', JSON.stringify(newUser));

      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка регистрации',
      });
      throw error;
    }
  };

  const logout = () => {
    // Очищаем хранилище
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const updateProfile = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({ ...prev, user: updatedUser }));

      // Обновляем в localStorage
      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
