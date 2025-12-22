// src/types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  tag: string;
  level: number;
  gamesPlayed: number;
  totalHours: number;
  completionRate: number;
  favoriteGenre: string;
  joinDate: string;
  isOnline: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}