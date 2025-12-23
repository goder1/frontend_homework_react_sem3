// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gamesReducer from './slices/gamesSlice';
import profileReducer from './slices/profileSlice';
import favoritesReducer from './slices/favoritesSlice';

// Загружаем сохраненное состояние из localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state:', err);
    return undefined;
  }
};

// Предзагруженное состояние
const preloadedState = {
  auth: loadAuthState(),
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    profile: profileReducer,
    favorites: favoritesReducer,
  },
  preloadedState,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'auth/checkAuth/fulfilled',
          'auth/checkAuth/rejected',
        ],
        ignoredPaths: ['auth.user'],
      },
    }).concat((store: any) => (next: any) => (action: any) => {
      const result = next(action);

      // Сохраняем только auth состояние
      if (action.type.startsWith('auth/')) {
        const authState = store.getState().auth;
        try {
          // Не сохраняем isLoading
          const stateToSave = {
            user: authState.user,
            isAuthenticated: authState.isAuthenticated,
            isInitialized: true,
            error: null,
          };
          localStorage.setItem('authState', JSON.stringify(stateToSave));
        } catch (err) {
          console.error('Error saving auth state:', err);
        }
      }

      return result;
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
