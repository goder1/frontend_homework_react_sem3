// src/store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { UserGame, ProfileStats, ProfileState, AddGameData, UpdateGameData } from '../../types/profile';

const initialStats: ProfileStats = {
  totalGames: 0,
  totalHours: 0,
  averageRating: 0,
  completionRate: 0,
  favoriteGenre: 'Не указан',
  favoritePlatform: 'Не указана',
  achievementsTotal: 0,
  achievementsCompleted: 0,
  gamesByStatus: {
    playing: 0,
    completed: 0,
    'on-hold': 0,
    dropped: 0,
    planning: 0,
  },
};

// Моковые данные для начала
const initialUserGames: UserGame[] = [
  {
    id: 1,
    gameId: 2,
    userId: '1',
    userRating: 5,
    hoursPlayed: 156,
    achievementsCompleted: 32,
    totalAchievements: 42,
    completionPercentage: 76,
    status: 'completed',
    lastPlayed: '2024-01-15',
    notes: 'Эпическое приключение! Игра года безусловно.',
    createdAt: '2023-06-10T10:00:00Z',
    updatedAt: '2024-01-15T15:30:00Z',
  },
  {
    id: 2,
    gameId: 5,
    userId: '1',
    userRating: 5,
    hoursPlayed: 243,
    achievementsCompleted: 76,
    totalAchievements: 78,
    completionPercentage: 97,
    status: 'completed',
    lastPlayed: '2024-01-10',
    notes: 'Лучшая RPG всех времен. Перепроходил 3 раза.',
    createdAt: '2022-12-05T14:20:00Z',
    updatedAt: '2024-01-10T18:45:00Z',
  },
  {
    id: 3,
    gameId: 1,
    userId: '1',
    userRating: 4,
    hoursPlayed: 87,
    achievementsCompleted: 23,
    totalAchievements: 168,
    completionPercentage: 14,
    status: 'playing',
    lastPlayed: '2024-01-05',
    notes: 'Отличная атмосфера, но баги мешают.',
    createdAt: '2023-11-20T09:15:00Z',
    updatedAt: '2024-01-05T20:10:00Z',
  },
];

const initialState: ProfileState = {
  userGames: initialUserGames,
  stats: calculateStats(initialUserGames),
  isLoading: false,
  error: null,
};

// Вспомогательная функция для расчета статистики
function calculateStats(userGames: UserGame[]): ProfileStats {
  if (userGames.length === 0) return initialStats;

  const stats: ProfileStats = {
    totalGames: userGames.length,
    totalHours: userGames.reduce((sum, game) => sum + game.hoursPlayed, 0),
    averageRating: userGames.reduce((sum, game) => sum + game.userRating, 0) / userGames.length,
    completionRate: userGames.reduce((sum, game) => sum + game.completionPercentage, 0) / userGames.length,
    favoriteGenre: 'RPG', // TODO: Рассчитать по жанрам из gamesSlice
    favoritePlatform: 'PC', // TODO: Рассчитать по платформам
    achievementsTotal: userGames.reduce((sum, game) => sum + game.totalAchievements, 0),
    achievementsCompleted: userGames.reduce((sum, game) => sum + game.achievementsCompleted, 0),
    gamesByStatus: {
      playing: userGames.filter(g => g.status === 'playing').length,
      completed: userGames.filter(g => g.status === 'completed').length,
      'on-hold': userGames.filter(g => g.status === 'on-hold').length,
      dropped: userGames.filter(g => g.status === 'dropped').length,
      planning: userGames.filter(g => g.status === 'planning').length,
    },
  };

  return stats;
}

// Асинхронный thunk для загрузки игр пользователя
export const fetchUserGames = createAsyncThunk(
  'profile/fetchUserGames',
  async (userId: string, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // const response = await fetch(`/api/users/${userId}/games`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Возвращаем моковые данные
      return initialUserGames.filter(game => game.userId === userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке игр пользователя');
    }
  }
);

// Асинхронный thunk для добавления игры
export const addUserGame = createAsyncThunk(
  'profile/addGame',
  async ({ userId, gameData }: { userId: string; gameData: AddGameData }, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // const response = await fetch(`/api/users/${userId}/games`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(gameData),
      // });
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newGame: UserGame = {
        id: Date.now(),
        gameId: gameData.gameId,
        userId,
        userRating: gameData.userRating || 0,
        hoursPlayed: gameData.hoursPlayed || 0,
        achievementsCompleted: gameData.achievementsCompleted || 0,
        totalAchievements: 0, // TODO: Получить из gamesSlice
        completionPercentage: 0,
        status: gameData.status || 'playing',
        notes: gameData.notes,
        lastPlayed: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newGame;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при добавлении игры');
    }
  }
);

// Асинхронный thunk для обновления игры
export const updateUserGame = createAsyncThunk(
  'profile/updateGame',
  async ({ gameId, updateData }: { gameId: number; updateData: UpdateGameData }, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // const response = await fetch(`/api/user-games/${gameId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updateData),
      // });
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { gameId, updateData };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении игры');
    }
  }
);

// Асинхронный thunk для удаления игры
export const removeUserGame = createAsyncThunk(
  'profile/removeGame',
  async (gameId: number, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный API
      // await fetch(`/api/user-games/${gameId}`, { method: 'DELETE' });
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return gameId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении игры');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Синхронное добавление игры (без API)
    addGame: (state, action: PayloadAction<UserGame>) => {
      // Проверяем, нет ли уже такой игры
      const existing = state.userGames.find(
        game => game.gameId === action.payload.gameId && game.userId === action.payload.userId
      );
      
      if (!existing) {
        state.userGames.unshift(action.payload);
        state.stats = calculateStats(state.userGames);
      }
    },
    
    // Синхронное обновление игры
    updateGame: (state, action: PayloadAction<{ gameId: number; updateData: UpdateGameData }>) => {
      const { gameId, updateData } = action.payload;
      const index = state.userGames.findIndex(game => game.id === gameId);
      
      if (index !== -1) {
        state.userGames[index] = {
          ...state.userGames[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        state.stats = calculateStats(state.userGames);
      }
    },
    
    // Синхронное удаление игры
    removeGame: (state, action: PayloadAction<number>) => {
      state.userGames = state.userGames.filter(game => game.id !== action.payload);
      state.stats = calculateStats(state.userGames);
    },
    
    // Обновление статистики
    updateStats: (state, action: PayloadAction<Partial<ProfileStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
    
    // Сброс профиля (при выходе)
    resetProfile: (state) => {
      state.userGames = [];
      state.stats = initialStats;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Загрузка игр пользователя
      .addCase(fetchUserGames.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userGames = action.payload;
        state.stats = calculateStats(action.payload);
      })
      .addCase(fetchUserGames.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Добавление игры
      .addCase(addUserGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addUserGame.fulfilled, (state, action) => {
        state.isLoading = false;
        // Проверяем, нет ли дубликата
        const existing = state.userGames.find(
          game => game.gameId === action.payload.gameId && game.userId === action.payload.userId
        );
        if (!existing) {
          state.userGames.unshift(action.payload);
          state.stats = calculateStats(state.userGames);
        }
      })
      .addCase(addUserGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Обновление игры
      .addCase(updateUserGame.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserGame.fulfilled, (state, action) => {
        state.isLoading = false;
        const { gameId, updateData } = action.payload;
        const index = state.userGames.findIndex(game => game.id === gameId);
        
        if (index !== -1) {
          state.userGames[index] = {
            ...state.userGames[index],
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
          state.stats = calculateStats(state.userGames);
        }
      })
      .addCase(updateUserGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Удаление игры
      .addCase(removeUserGame.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeUserGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userGames = state.userGames.filter(game => game.id !== action.payload);
        state.stats = calculateStats(state.userGames);
      })
      .addCase(removeUserGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  addGame, 
  updateGame, 
  removeGame, 
  updateStats, 
  clearError, 
  resetProfile 
} = profileSlice.actions;

export default profileSlice.reducer;

// Селекторы
export const selectUserGames = (state: RootState) => state.profile.userGames;
export const selectProfileStats = (state: RootState) => state.profile.stats;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;

// Селектор для игры пользователя по ID игры
export const selectUserGameByGameId = (gameId: number) => 
  (state: RootState) => state.profile.userGames.find(game => game.gameId === gameId);

// Селектор для игры пользователя по ID записи
export const selectUserGameById = (userGameId: number) => 
  (state: RootState) => state.profile.userGames.find(game => game.id === userGameId);

// Селектор для игр по статусу
export const selectUserGamesByStatus = (status: UserGame['status']) =>
  (state: RootState) => state.profile.userGames.filter(game => game.status === status);

// Селектор для отфильтрованных игр (с пагинацией)
export const selectPaginatedUserGames = (page: number, gamesPerPage: number) =>
  createSelector(
    [selectUserGames],
    (userGames) => {
      const startIndex = (page - 1) * gamesPerPage;
      return userGames.slice(startIndex, startIndex + gamesPerPage);
    }
  );

// Селектор для общего количества игр пользователя
export const selectTotalUserGames = createSelector(
  [selectUserGames],
  (userGames) => userGames.length
);

// Селектор для последних игр
export const selectRecentUserGames = (limit: number = 5) =>
  createSelector(
    [selectUserGames],
    (userGames) => 
      [...userGames]
        .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
        .slice(0, limit)
  );