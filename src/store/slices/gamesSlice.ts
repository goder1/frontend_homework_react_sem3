// src/store/slices/gamesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Game, FilterState, Platform } from '../../types/game';
import { RootState } from '..';

interface GamesState {
  games: Game[];
  filteredGames: Game[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  selectedGame: Game | null;
}

// Вспомогательная функция для фильтрации
const applyFilters = (games: Game[], filters: FilterState): Game[] => {
  let result = [...games];

  // Поиск
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(game =>
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.genres.some(genre => genre.toLowerCase().includes(query))
    );
  }

  // Платформы
  if (filters.platforms.length > 0) {
    result = result.filter(game =>
      filters.platforms.some(platform => game.platforms.includes(platform))
    );
  }

  // Жанры
  if (filters.genres.length > 0) {
    result = result.filter(game =>
      filters.genres.some(genre => game.genres.includes(genre))
    );
  }

  // Сортировка
  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      result.sort((a, b) => 
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      break;
    case 'release':
      result.sort((a, b) => 
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );
      break;
    case 'popular':
    default:
      // Можно добавить логику популярности на основе оценок/просмотров
      break;
  }

  return result;
};

// Моковые данные (будут заменены на данные из БД)
const mockGames: Game[] = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Научно-фантастическая RPG в открытом мире от создателей Ведьмака.',
    rating: 4.5,
    platforms: ['PC', 'PS5', 'Xbox'] as Platform[],
    genres: ['RPG', 'Action'],
    imageUrl: 'public/images/cyberpunk.png',
    isFavorite: false,
    releaseDate: '2020-12-10',
  },
  {
    id: 2,
    title: 'Elden Ring',
    description: 'Фэнтезийная action-RPG от создателей Dark Souls.',
    rating: 4.8,
    platforms: ['PC', 'PS5', 'Xbox'] as Platform[],
    genres: ['RPG', 'Action', 'Fantasy'],
    imageUrl: 'public/images/elden.webp',
    isFavorite: false,
    releaseDate: '2022-02-25',
  },
  {
    id: 3,
    title: 'Starfield',
    description: 'Следующая генерация RPG от Bethesda Game Studios.',
    rating: 4.2,
    platforms: ['PC', 'Xbox'] as Platform[],
    genres: ['RPG', 'Sci-Fi'],
    imageUrl: 'public/images/starfield.webp',
    isFavorite: false,
    releaseDate: '2023-09-06',
  },
  {
    id: 4,
    title: 'God of War Ragnarök',
    description: 'Продолжение эпического приключения Кратоса и Атрея.',
    rating: 4.9,
    platforms: ['PS5'] as Platform[],
    genres: ['Action', 'Adventure'],
    imageUrl: 'public/images/god_of_war.webp',
    isFavorite: false,
    releaseDate: '2022-11-09',
  },
  {
    id: 5,
    title: 'Halo Infinite',
    description: 'Возвращение легендарного Мастера Чифа.',
    rating: 4.3,
    platforms: ['PC', 'Xbox'] as Platform[],
    genres: ['Action', 'FPS'],
    imageUrl: 'public/images/halo.jpg',
    isFavorite: false,
    releaseDate: '2021-12-08',
  },
  {
    id: 6,
    title: 'Total War: Warhammer III',
    description: 'Грандиозная стратегия в мире Warhammer Fantasy.',
    rating: 4.6,
    platforms: ['PC'] as Platform[],
    genres: ['Strategy', 'Fantasy'],
    imageUrl: 'public/images/total_war.jpg',
    isFavorite: false,
    releaseDate: '2022-02-17',
  },
  {
    id: 7,
    title: 'ARC Raiders',
    description: 'В ARC Raiders вас ждет Поверхность, которой заправляют смертоносные машины.',
    rating: 4.5,
    platforms: ['PC', 'PS5', 'Xbox'] as Platform[],
    genres: ['TPS', 'Action'],
    imageUrl: 'public/images/arc_raiders.webp',
    isFavorite: false,
    releaseDate: '2024-01-01',
  },
  {
    id: 8,
    title: 'Hollow Knight: Silksong',
    description: 'Эпическое продолжение удостоенной множества наград приключенческой игры.',
    rating: 4.7,
    platforms: ['PC', 'PS5', 'Xbox'] as Platform[],
    genres: ['Metroidvania', 'Indie', 'Platformer'],
    imageUrl: 'public/images/silksong.jpg',
    isFavorite: false,
    releaseDate: '2024-12-31',
  },
  {
    id: 9,
    title: 'Baldur\'s Gate 3',
    description: 'Эпическая RPG с глубоким сюжетом и тактическими боями.',
    rating: 4.9,
    platforms: ['PC', 'PS5'] as Platform[],
    genres: ['RPG', 'Strategy', 'Adventure'],
    imageUrl: 'public/images/baldurs_gate.jpg',
    isFavorite: false,
    releaseDate: '2023-08-03',
  },
  {
    id: 10,
    title: 'The Witcher 3: Wild Hunt',
    description: 'Эпическая RPG в мире фэнтези от CD Projekt Red.',
    rating: 4.9,
    platforms: ['PC', 'PS5', 'Xbox'] as Platform[],
    genres: ['RPG', 'Action', 'Adventure'],
    imageUrl: 'public/images/witcher3.jpg',
    isFavorite: false,
    releaseDate: '2015-05-19',
  },
];

const initialState: GamesState = {
  games: mockGames,
  filteredGames: mockGames,
  filters: {
    platforms: [],
    genres: [],
    sortBy: 'popular',
    searchQuery: '',
  },
  isLoading: false,
  error: null,
  selectedGame: null,
};

// Асинхронный thunk для загрузки игр из БД
export const fetchGames = createAsyncThunk(
  'games/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный запрос к БД
      // const response = await fetch('/api/games');
      // const data = await response.json();
      
      // Имитация загрузки
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Пока возвращаем моковые данные
      return mockGames;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке игр');
    }
  }
);

// Асинхронный thunk для получения игры по ID
export const fetchGameById = createAsyncThunk(
  'games/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      // TODO: Заменить на реальный запрос к БД
      // const response = await fetch(`/api/games/${id}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const game = mockGames.find(g => g.id === id);
      if (!game) {
        throw new Error('Игра не найдена');
      }
      
      return game;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке игры');
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    // Обновление фильтров
    updateFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredGames = applyFilters(state.games, state.filters);
    },
    
    // Сброс фильтров
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredGames = state.games;
    },
    
    // Установка выбранной игры
    setSelectedGame: (state, action: PayloadAction<Game | null>) => {
      state.selectedGame = action.payload;
    },
    
    // Обновление статуса избранного для игры
    updateGameFavoriteStatus: (state, action: PayloadAction<{ id: number; isFavorite: boolean }>) => {
      const { id, isFavorite } = action.payload;
      
      // Обновляем в основном массиве
      const gameIndex = state.games.findIndex(g => g.id === id);
      if (gameIndex !== -1) {
        state.games[gameIndex].isFavorite = isFavorite;
      }
      
      // Обновляем в отфильтрованном массиве
      const filteredIndex = state.filteredGames.findIndex(g => g.id === id);
      if (filteredIndex !== -1) {
        state.filteredGames[filteredIndex].isFavorite = isFavorite;
      }
      
      // Обновляем выбранную игру если она активна
      if (state.selectedGame?.id === id) {
        state.selectedGame.isFavorite = isFavorite;
      }
    },
    
    // Добавление новой игры (для админки)
    addGame: (state, action: PayloadAction<Game>) => {
      state.games.unshift(action.payload);
      state.filteredGames = applyFilters(state.games, state.filters);
    },
    
    // Обновление игры
    updateGame: (state, action: PayloadAction<Game>) => {
      const index = state.games.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.games[index] = action.payload;
        state.filteredGames = applyFilters(state.games, state.filters);
      }
    },
    
    // Удаление игры
    removeGame: (state, action: PayloadAction<number>) => {
      state.games = state.games.filter(g => g.id !== action.payload);
      state.filteredGames = applyFilters(state.games, state.filters);
    },
    
    // Очистка ошибок
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Загрузка всех игр
      .addCase(fetchGames.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.games = action.payload;
        state.filteredGames = applyFilters(action.payload, state.filters);
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Загрузка игры по ID
      .addCase(fetchGameById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGame = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  updateFilters, 
  resetFilters, 
  setSelectedGame,
  updateGameFavoriteStatus,
  addGame, 
  updateGame, 
  removeGame, 
  clearError 
} = gamesSlice.actions;

export default gamesSlice.reducer;

// Селекторы
export const selectAllGames = (state: RootState) => state.games.games;
export const selectFilteredGames = (state: RootState) => state.games.filteredGames;
export const selectGamesFilters = (state: RootState) => state.games.filters;
export const selectSelectedGame = (state: RootState) => state.games.selectedGame;
export const selectGamesLoading = (state: RootState) => state.games.isLoading;
export const selectGamesError = (state: RootState) => state.games.error;

// Селекторы для популярных игр
export const selectPopularGames = createSelector(
  [selectFilteredGames],
  (filteredGames) => filteredGames.slice(0, 6)
);

// Селекторы для новых релизов
export const selectNewReleases = createSelector(
  [selectAllGames],
  (games) => [...games]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 4)
);

// Селектор для игры по ID
export const selectGameById = (id: number) => 
  (state: RootState) => state.games.games.find(game => game.id === id);

// Селектор для похожих игр (по жанрам)
export const selectSimilarGames = (gameId: number, limit: number = 3) =>
  createSelector(
    [selectAllGames],
    (games) => {
      const game = games.find(g => g.id === gameId);
      if (!game) return [];
      
      return games
        .filter(g => g.id !== gameId && 
          g.genres.some(genre => game.genres.includes(genre))
        )
        .slice(0, limit);
    }
  );

// Селектор для всех уникальных жанров
export const selectAllGenres = createSelector(
  [selectAllGames],
  (games) => {
    const allGenres = games.flatMap(game => game.genres);
    return Array.from(new Set(allGenres)).sort();
  }
);

// Селектор для всех уникальных платформ
export const selectAllPlatforms = createSelector(
  [selectAllGames],
  (games) => {
    const allPlatforms = games.flatMap(game => game.platforms);
    return Array.from(new Set(allPlatforms)).sort();
  }
);