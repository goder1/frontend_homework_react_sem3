// src/store/slices/favoritesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Game } from '../../types/game';

interface FavoritesState {
  favorites: Game[];
  isLoading: boolean;
  error: string | null;
}

// Загружаем избранное из localStorage
const loadFavoritesFromStorage = (): Game[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
};

// Сохраняем в localStorage
const saveFavoritesToStorage = (favorites: Game[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

const initialState: FavoritesState = {
  favorites: loadFavoritesFromStorage(),
  isLoading: false,
  error: null,
};

// Асинхронный thunk для добавления в избранное
export const addToFavorites = createAsyncThunk(
  'favorites/add',
  async (game: Game, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // await fetch(`/api/favorites/${game.id}/add`, { method: 'POST' });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return game;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при добавлении в избранное');
    }
  }
);

// Асинхронный thunk для удаления из избранного
export const removeFromFavorites = createAsyncThunk(
  'favorites/remove',
  async (gameId: number, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // await fetch(`/api/favorites/${gameId}/remove`, { method: 'DELETE' });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return gameId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении из избранного');
    }
  }
);

// Асинхронный thunk для переключения избранного
export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async ({ game, isFavorite }: { game: Game; isFavorite: boolean }, { rejectWithValue, dispatch }) => {
    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(game.id)).unwrap();
        return { game, isFavorite: false };
      } else {
        await dispatch(addToFavorites(game)).unwrap();
        return { game, isFavorite: true };
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при переключении избранного');
    }
  }
);

// Асинхронный thunk для загрузки избранного
export const loadFavorites = createAsyncThunk(
  'favorites/load',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // const response = await fetch('/api/favorites');
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Возвращаем данные из localStorage как имитацию ответа API
      return loadFavoritesFromStorage();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке избранного');
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Синхронное добавление (без API)
    addFavorite: (state, action: PayloadAction<Game>) => {
      const existing = state.favorites.find(f => f.id === action.payload.id);
      if (!existing) {
        state.favorites.push(action.payload);
        saveFavoritesToStorage(state.favorites);
      }
    },
    
    // Синхронное удаление (без API)
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(game => game.id !== action.payload);
      saveFavoritesToStorage(state.favorites);
    },
    
    // Синхронное переключение (без API)
    toggleFavoriteSync: (state, action: PayloadAction<{ game: Game; isFavorite: boolean }>) => {
      const { game, isFavorite } = action.payload;
      
      if (isFavorite) {
        state.favorites = state.favorites.filter(f => f.id !== game.id);
      } else {
        const existing = state.favorites.find(f => f.id === game.id);
        if (!existing) {
          state.favorites.push({ ...game, isFavorite: true });
        }
      }
      saveFavoritesToStorage(state.favorites.map(f => ({ ...f, isFavorite: true })));
    },
    
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
    
    // Очистка всех избранных
    clearFavorites: (state) => {
      state.favorites = [];
      saveFavoritesToStorage([]);
    },
  },
  extraReducers: (builder) => {
    builder
      // Добавление в избранное
      .addCase(addToFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        const existing = state.favorites.find(f => f.id === action.payload.id);
        if (!existing) {
          state.favorites.push({ ...action.payload, isFavorite: true });
          saveFavoritesToStorage(state.favorites);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Удаление из избранного
      .addCase(removeFromFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = state.favorites.filter(game => game.id !== action.payload);
        saveFavoritesToStorage(state.favorites);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Переключение избранного
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        const { game, isFavorite } = action.payload;
        
        if (isFavorite) {
          const existing = state.favorites.find(f => f.id === game.id);
          if (!existing) {
            state.favorites.push({ ...game, isFavorite: true });
          }
        } else {
          state.favorites = state.favorites.filter(f => f.id !== game.id);
        }
        saveFavoritesToStorage(state.favorites);
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Загрузка избранного
      .addCase(loadFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addFavorite, 
  removeFavorite, 
  toggleFavoriteSync, 
  clearError, 
  clearFavorites 
} = favoritesSlice.actions;
export default favoritesSlice.reducer;

// Селекторы
export const selectAllFavorites = (state: { favorites: FavoritesState }) => 
  state.favorites.favorites;

export const selectFavoriteIds = (state: { favorites: FavoritesState }) => 
  state.favorites.favorites.map(game => game.id);

export const selectIsFavorite = (gameId: number) => 
  (state: { favorites: FavoritesState }) => 
    state.favorites.favorites.some(game => game.id === gameId);

export const selectFavoritesCount = (state: { favorites: FavoritesState }) => 
  state.favorites.favorites.length;

export const selectFavoritesLoading = (state: { favorites: FavoritesState }) => 
  state.favorites.isLoading;

export const selectFavoritesError = (state: { favorites: FavoritesState }) => 
  state.favorites.error;

// Селектор для среднего рейтинга
export const selectAverageRating = (state: { favorites: FavoritesState }) => {
  const { favorites } = state.favorites;
  if (favorites.length === 0) return 0;
  
  const totalRating = favorites.reduce((sum, game) => sum + game.rating, 0);
  return totalRating / favorites.length;
};