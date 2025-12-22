// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AuthService from '../../services/authService.ts';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Флаг, что проверка авторизации выполнена
}

const initialState: AuthState = {
  user: AuthService.getCurrentUser(), // Получаем пользователя из localStorage
  loading: false,
  error: null,
  isAuthenticated: !!AuthService.getCurrentUser(),
  isInitialized: false,
};

// Проверка авторизации (загружаем пользователя из localStorage)
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка проверки авторизации');
    }
  }
);

// Регистрация пользователя
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }, { rejectWithValue }) => {
    try {
      const result = await AuthService.register(userData);
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка регистрации');
      }
      
      return result.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка регистрации');
    }
  }
);

// Авторизация пользователя
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }, { rejectWithValue }) => {
    try {
      const result = await AuthService.login(credentials.email, credentials.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка авторизации');
      }
      
      return result.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка авторизации');
    }
  }
);

// Выход
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    AuthService.logout();
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Проверка авторизации
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = action.payload as string || null;
      })
      
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Авторизация
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Выход
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;

// Селекторы
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;

export default authSlice.reducer;