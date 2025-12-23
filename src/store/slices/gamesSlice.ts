// src/store/slices/gamesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabaseClient';

// Типы
export interface Game {
  id: string;
  title: string;
  description: string;
  image_url: string;
  rating: number;
  price: number;
  release_date: string;
  achievements?: number;
  platforms?: string[];
  genres?: string[];
}

export interface GameWithRelations {
  id: string;
  title: string;
  description: string;
  image_url: string;
  rating: number;
  price: number;
  release_date: string;
  achievements?: number;
  game_platforms?: Array<{
    platforms: {
      id: string;
      name: string;
    }
  }>;
  game_genres?: Array<{
    genres: {
      id: string;
      name: string;
    }
  }>;
}

export type PlatformType = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo Switch';
export type SortByType = 'rating' | 'release_date' | 'title' | 'popular' | 'newest';
export type FilterState = {
  platforms: string[];
  genres: string[];
  sortBy: SortByType;
  searchQuery: string;
};

interface GamesState {
  games: Game[];
  featuredGames: Game[];
  newReleases: Game[];
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  filters: FilterState;
  allPlatforms: string[];
  allGenres: string[];
}

const initialState: GamesState = {
  games: [],
  featuredGames: [],
  newReleases: [],
  currentGame: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 12,
  filters: {
    searchQuery: '',
    platforms: [],
    genres: [],
    sortBy: 'popular'
  },
  allPlatforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
  allGenres: ['Action', 'RPG', 'Strategy', 'Adventure', 'Shooter', 'Simulation', 'Sports', 'Horror', 'Indie', 'Fantasy', 'Sci-Fi']
};

// Вспомогательная функция для преобразования игры с отношениями в простую игру
const transformGame = (gameWithRelations: any): Game => {
  console.log('Transforming game:', gameWithRelations?.title);
  
  // Обрабатываем image_url
  let imageUrl = gameWithRelations.image_url;
  
  if (imageUrl && !imageUrl.startsWith('http')) {
    // Если путь начинается с 'public/images/', преобразуем в полный URL
    if (imageUrl.startsWith('public/images/')) {
      const cleanPath = imageUrl.replace('public/', '');
      imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    } else if (imageUrl.startsWith('images/')) {
      // Или просто 'images/'
      imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
    }
  }

  // Извлекаем платформы
  const platforms = gameWithRelations.game_platforms?.map((gp: any) => 
    gp.platforms?.name
  ).filter(Boolean) || [];

  // Извлекаем жанры
  const genres = gameWithRelations.game_genres?.map((gg: any) => 
    gg.genres?.name
  ).filter(Boolean) || [];

  console.log(`  Platforms: ${platforms.join(', ')}`);
  console.log(`  Genres: ${genres.join(', ')}`);

  return {
    id: gameWithRelations.id,
    title: gameWithRelations.title,
    description: gameWithRelations.description,
    image_url: imageUrl,
    rating: gameWithRelations.rating,
    price: gameWithRelations.price,
    release_date: gameWithRelations.release_date,
    achievements: gameWithRelations.achievements,
    platforms: platforms,
    genres: genres
  };
};

// Получение игр с фильтрами
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { games: GamesState };
      const { page, limit, filters } = state.games;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      console.log('Fetching games with filters:', filters);

      let query = supabase
        .from('games')
        .select(`
          *,
          game_platforms (
            platforms (
              name
            )
          ),
          game_genres (
            genres (
              name
            )
          )
        `, { count: 'exact' });

      // Поиск
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      // Фильтрация по платформам
      if (filters.platforms.length > 0) {
        // Для фильтрации по платформам через связующую таблицу
        query = query.filter('game_platforms.platforms.name', 'in', `(${filters.platforms.join(',')})`);
      }

      // Фильтрация по жанрам
      if (filters.genres.length > 0) {
        query = query.filter('game_genres.genres.name', 'in', `(${filters.genres.join(',')})`);
      }

      // Сортировка
      let sortBy: 'rating' | 'release_date' | 'title' = 'rating';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      switch (filters.sortBy) {
        case 'popular':
        case 'rating':
          sortBy = 'rating';
          sortOrder = 'desc';
          break;
        case 'newest':
        case 'release':
          sortBy = 'release_date';
          sortOrder = 'desc';
          break;
        case 'title':
          sortBy = 'title';
          sortOrder = 'asc';
          break;
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Пагинация
      const { data: games, error, count } = await query.range(from, to);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Filtered games raw:', games);
      
      // Преобразуем данные
      const transformedGames = games?.map(transformGame) || [];

      return {
        games: transformedGames,
        total: count || 0
      };

    } catch (error: any) {
      console.error('Error in fetchGames:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Получение игры по ID
export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data: game, error } = await supabase
        .from('games')
        .select(`
          *,
          game_platforms (
            platforms (
              name
            )
          ),
          game_genres (
            genres (
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      console.log('Game by ID raw:', game);
      return transformGame(game);

    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Получение популярных игр (фичеред)
export const fetchFeaturedGames = createAsyncThunk(
  'games/fetchFeaturedGames',
  async (limit: number = 6, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { games: GamesState };
      const { filters } = state.games;
      
      console.log('Fetching featured games with filters:', filters);
      
      let query = supabase
        .from('games')
        .select(`
          *,
          game_platforms (
            platforms (
              name
            )
          ),
          game_genres (
            genres (
              name
            )
          )
        `)
        .order('rating', { ascending: false })
        .limit(limit);

      // Применяем фильтры
      if (filters.platforms.length > 0) {
        query = query.filter('game_platforms.platforms.name', 'in', `(${filters.platforms.join(',')})`);
      }
      
      if (filters.genres.length > 0) {
        query = query.filter('game_genres.genres.name', 'in', `(${filters.genres.join(',')})`);
      }
      
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data: games, error } = await query;

      if (error) {
        console.error('Error fetching featured games:', error);
        throw error;
      }
      
      console.log('Raw featured games from Supabase:', games);
      const transformedGames = games?.map(transformGame) || [];
      console.log('Transformed featured games:', transformedGames);
      return transformedGames;

    } catch (error: any) {
      console.error('Error in fetchFeaturedGames:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Получение новых релизов
export const fetchNewReleases = createAsyncThunk(
  'games/fetchNewReleases',
  async (limit: number = 6, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { games: GamesState };
      const { filters } = state.games;
      
      console.log('Fetching new releases with filters:', filters);
      
      let query = supabase
        .from('games')
        .select(`
          *,
          game_platforms (
            platforms (
              name
            )
          ),
          game_genres (
            genres (
              name
            )
          )
        `)
        .order('release_date', { ascending: false })
        .limit(limit);

      // Применяем фильтры
      if (filters.platforms.length > 0) {
        query = query.filter('game_platforms.platforms.name', 'in', `(${filters.platforms.join(',')})`);
      }
      
      if (filters.genres.length > 0) {
        query = query.filter('game_genres.genres.name', 'in', `(${filters.genres.join(',')})`);
      }
      
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data: games, error } = await query;

      if (error) {
        console.error('Error fetching new releases:', error);
        throw error;
      }
      
      console.log('Raw new releases from Supabase:', games);
      const transformedGames = games?.map(transformGame) || [];
      console.log('Transformed new releases:', transformedGames);
      return transformedGames;

    } catch (error: any) {
      console.error('Error in fetchNewReleases:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Получение ВСЕХ игр (без пагинации и фильтров)
export const fetchAllGames = createAsyncThunk(
  'games/fetchAllGames',
  async (_, { rejectWithValue }) => {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          game_platforms (
            platforms (
              name
            )
          ),
          game_genres (
            genres (
              name
            )
          )
        `)
        .order('title', { ascending: true });

      if (error) throw error;
      console.log('All games raw:', games);
      const transformedGames = games?.map(transformGame) || [];
      return transformedGames;

    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Сбрасываем страницу при изменении фильтров
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
    clearCurrentGame: (state) => {
      state.currentGame = null;
    },
    setAllGames: (state, action: PayloadAction<Game[]>) => {
      state.games = action.payload;
    },
    // Новый action для принудительной перезагрузки
    triggerGamesRefresh: (state) => {
      // Просто меняем page, чтобы triggerнуть эффект
      state.page = state.page;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchGames
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload.games;
        state.total = action.payload.total;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchGameById
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = action.payload;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchFeaturedGames
      .addCase(fetchFeaturedGames.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedGames.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredGames = action.payload;
      })
      .addCase(fetchFeaturedGames.rejected, (state) => {
        state.loading = false;
      })
      
      // fetchNewReleases
      .addCase(fetchNewReleases.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNewReleases.fulfilled, (state, action) => {
        state.loading = false;
        state.newReleases = action.payload;
      })
      .addCase(fetchNewReleases.rejected, (state) => {
        state.loading = false;
      })
      
      // fetchAllGames
      .addCase(fetchAllGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchAllGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Экспортируем actions
export const {
  setPage,
  updateFilters,
  resetFilters,
  clearCurrentGame,
  setAllGames,
  triggerGamesRefresh
} = gamesSlice.actions;

// Селекторы
export const selectGames = (state: { games: GamesState }) => state.games.games;
export const selectFeaturedGames = (state: { games: GamesState }) => state.games.featuredGames;
export const selectNewReleases = (state: { games: GamesState }) => state.games.newReleases;
export const selectCurrentGame = (state: { games: GamesState }) => state.games.currentGame;
export const selectGamesLoading = (state: { games: GamesState }) => state.games.loading;
export const selectGamesError = (state: { games: GamesState }) => state.games.error;
export const selectGamesTotal = (state: { games: GamesState }) => state.games.total;
export const selectGamesPage = (state: { games: GamesState }) => state.games.page;
export const selectGamesFilters = (state: { games: GamesState }) => state.games.filters;
export const selectAllPlatforms = (state: { games: GamesState }) => state.games.allPlatforms;
export const selectAllGenres = (state: { games: GamesState }) => state.games.allGenres;

// Новый селектор для получения всех игр (alias для selectGames)
export const selectAllGames = (state: { games: GamesState }) => state.games.games;

export default gamesSlice.reducer;