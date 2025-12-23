// src/store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { UserGame, ProfileStats, ProfileState, AddGameData, UpdateGameData } from '../../types/profile';
import { supabase } from '../../lib/supabaseClient';
import { Game } from './gamesSlice';

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

const initialState: ProfileState = {
  userGames: [],
  stats: initialStats,
  isLoading: false,
  error: null,
};

// Вспомогательная функция для расчета статистики
function calculateStats(userGames: UserGame[], allGames: Game[] = []): ProfileStats {
  if (userGames.length === 0) return initialStats;

  // Создаем карту игр для быстрого доступа
  const gamesMap = new Map<string, Game>();
  allGames.forEach(game => gamesMap.set(game.id, game));

  const stats: ProfileStats = {
    totalGames: userGames.length,
    totalHours: userGames.reduce((sum, game) => sum + game.hoursPlayed, 0),
    averageRating: userGames.reduce((sum, game) => sum + game.userRating, 0) / userGames.length,
    completionRate: userGames.reduce((sum, game) => sum + game.completionPercentage, 0) / userGames.length,
    favoriteGenre: 'Не указан',
    favoritePlatform: 'Не указана',
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

  // Рассчитываем любимый жанр и платформу
  const genreCount: Record<string, number> = {};
  const platformCount: Record<string, number> = {};

  userGames.forEach(userGame => {
    const game = gamesMap.get(userGame.gameId);
    if (game) {
      // Жанры
      if (game.genres) {
        game.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }

      // Платформы
      if (game.platforms) {
        game.platforms.forEach(platform => {
          platformCount[platform] = (platformCount[platform] || 0) + 1;
        });
      }
    }
  });

  // Находим самый популярный жанр
  let maxGenreCount = 0;
  let favoriteGenre = 'Не указан';
  Object.entries(genreCount).forEach(([genre, count]) => {
    if (count > maxGenreCount) {
      maxGenreCount = count;
      favoriteGenre = genre;
    }
  });

  // Находим самую популярную платформу
  let maxPlatformCount = 0;
  let favoritePlatform = 'Не указана';
  Object.entries(platformCount).forEach(([platform, count]) => {
    if (count > maxPlatformCount) {
      maxPlatformCount = count;
      favoritePlatform = platform;
    }
  });

  stats.favoriteGenre = favoriteGenre;
  stats.favoritePlatform = favoritePlatform;

  return stats;
}

// Асинхронный thunk для загрузки игр пользователя
export const fetchUserGames = createAsyncThunk(
  'profile/fetchUserGames',
  async (userId: string, { rejectWithValue, getState }) => {
    try {
      // Получаем игры пользователя из Supabase
      const { data: userGames, error } = await supabase
        .from('user_games')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Преобразуем данные из формата Supabase в наш формат
      const formattedUserGames: UserGame[] = userGames.map(game => ({
        id: game.id,
        gameId: game.game_id,
        userId: game.user_id,
        userRating: game.user_rating || 0,
        hoursPlayed: game.hours_played || 0,
        achievementsCompleted: game.achievements_completed || 0,
        totalAchievements: 0, // В вашей таблице нет этого поля, нужно добавить или рассчитать
        completionPercentage: 0, // В вашей таблице нет этого поля
        status: game.status || 'playing',
        lastPlayed: game.last_played ? new Date(game.last_played).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: game.notes || '',
        createdAt: game.created_at || new Date().toISOString(),
        updatedAt: game.updated_at || new Date().toISOString(),
      }));

      return formattedUserGames;
    } catch (error: any) {
      console.error('Ошибка при загрузке игр пользователя:', error);
      return rejectWithValue(error.message || 'Ошибка при загрузке игр пользователя');
    }
  }
);

// Асинхронный thunk для добавления игры
export const addUserGame = createAsyncThunk(
  'profile/addGame',
  async ({ userId, gameData }: { userId: string; gameData: AddGameData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const allGames = selectAllGames(state);
      // Ищем игру по ID (теперь gameId должен быть string/UUID)
      const game = allGames.find(g => g.id === gameData.gameId.toString());

      if (!game) {
        throw new Error('Игра не найдена');
      }

      // Вставляем данные в Supabase
      const { data, error } = await supabase
        .from('user_games')
        .insert({
          user_id: userId,
          game_id: gameData.gameId.toString(),
          user_rating: gameData.userRating || 0,
          hours_played: gameData.hoursPlayed || 0,
          achievements_completed: gameData.achievementsCompleted || 0,
          status: gameData.status || 'playing',
          last_played: new Date().toISOString(),
          notes: gameData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Преобразуем обратно в наш формат
      const newGame: UserGame = {
        id: data.id,
        gameId: data.game_id,
        userId: data.user_id,
        userRating: data.user_rating,
        hoursPlayed: data.hours_played,
        achievementsCompleted: data.achievements_completed,
        totalAchievements: 0, // Нужно получить из таблицы игр или добавить поле
        completionPercentage: 0, // Можно рассчитать
        status: data.status,
        lastPlayed: data.last_played ? new Date(data.last_played).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return newGame;
    } catch (error: any) {
      console.error('Ошибка при добавлении игры:', error);
      return rejectWithValue(error.message || 'Ошибка при добавлении игры');
    }
  }
);

// Асинхронный thunk для обновления игры
export const updateUserGame = createAsyncThunk(
  'profile/updateGame',
  async ({ gameId, updateData }: { gameId: string; updateData: UpdateGameData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const userGame = selectUserGameById(gameId)(state);
      
      if (!userGame) {
        throw new Error('Игра не найдена');
      }

      // Обновляем данные в Supabase
      const { data, error } = await supabase
        .from('user_games')
        .update({
          user_rating: updateData.userRating ?? userGame.userRating,
          hours_played: updateData.hoursPlayed ?? userGame.hoursPlayed,
          achievements_completed: updateData.achievementsCompleted ?? userGame.achievementsCompleted,
          status: updateData.status ?? userGame.status,
          last_played: updateData.lastPlayed ? new Date(updateData.lastPlayed).toISOString() : userGame.lastPlayed,
          notes: updateData.notes ?? userGame.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) throw error;

      return { 
        gameId, 
        updateData: {
          ...updateData,
          updatedAt: data.updated_at,
        } 
      };
    } catch (error: any) {
      console.error('Ошибка при обновлении игры:', error);
      return rejectWithValue(error.message || 'Ошибка при обновлении игры');
    }
  }
);

// Асинхронный thunk для удаления игры
export const removeUserGame = createAsyncThunk(
  'profile/removeGame',
  async (gameId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('user_games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;

      return gameId;
    } catch (error: any) {
      console.error('Ошибка при удалении игры:', error);
      return rejectWithValue(error.message || 'Ошибка при удалении игры');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Синхронное добавление игры (без API) - для офлайн использования
    addGame: (state, action: PayloadAction<UserGame>) => {
      // Проверяем, нет ли уже такой игры
      const existing = state.userGames.find(
        game => game.gameId === action.payload.gameId && game.userId === action.payload.userId
      );
      
      if (!existing) {
        state.userGames.unshift(action.payload);
        // Для расчета статистики нужны все игры, получаем их из состояния
        const stateRoot = state as unknown as RootState;
        const allGames = selectAllGames(stateRoot);
        state.stats = calculateStats(state.userGames, allGames);
      }
    },
    
    // Синхронное обновление игры
    updateGame: (state, action: PayloadAction<{ gameId: string; updateData: UpdateGameData }>) => {
      const { gameId, updateData } = action.payload;
      const index = state.userGames.findIndex(game => game.id === gameId);
      
      if (index !== -1) {
        state.userGames[index] = {
          ...state.userGames[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        const stateRoot = state as unknown as RootState;
        const allGames = selectAllGames(stateRoot);
        state.stats = calculateStats(state.userGames, allGames);
      }
    },
    
    // Синхронное удаление игры
    removeGame: (state, action: PayloadAction<string>) => {
      state.userGames = state.userGames.filter(game => game.id !== action.payload);
      const stateRoot = state as unknown as RootState;
      const allGames = selectAllGames(stateRoot);
      state.stats = calculateStats(state.userGames, allGames);
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
        // Для расчета статистики нужны все игры, получаем их из состояния
        const stateRoot = state as unknown as RootState;
        const allGames = selectAllGames(stateRoot);
        state.stats = calculateStats(action.payload, allGames);
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
          const stateRoot = state as unknown as RootState;
          const allGames = selectAllGames(stateRoot);
          state.stats = calculateStats(state.userGames, allGames);
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
          };
          const stateRoot = state as unknown as RootState;
          const allGames = selectAllGames(stateRoot);
          state.stats = calculateStats(state.userGames, allGames);
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
        const stateRoot = state as unknown as RootState;
        const allGames = selectAllGames(stateRoot);
        state.stats = calculateStats(state.userGames, allGames);
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

// Импортируем селектор всех игр из gamesSlice
export const selectAllGames = (state: RootState) => state.games.games;

// Селектор для игры пользователя по ID игры
export const selectUserGameByGameId = (gameId: string) => 
  (state: RootState) => state.profile.userGames.find(game => game.gameId === gameId);

// Селектор для игры пользователя по ID записи
export const selectUserGameById = (userGameId: string) => 
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

// Селектор для поиска игр пользователя с деталями игры
export const selectUserGamesWithDetails = createSelector(
  [selectUserGames, selectAllGames],
  (userGames, allGames) => {
    const gamesMap = new Map<string, Game>();
    allGames.forEach(game => gamesMap.set(game.id, game));

    return userGames.map(userGame => ({
      ...userGame,
      game: gamesMap.get(userGame.gameId)
    })).filter(item => item.game); // Фильтруем только те, у которых есть детали игры
  }
);