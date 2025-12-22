import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gamesReducer from './slices/gamesSlice';
import profileReducer from './slices/profileSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    games: gamesReducer,
    profile: profileReducer,
    favorites: favoritesReducer,
  },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем эти типы действий (для thunk)
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  // DevTools автоматически включаются в development режиме
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;