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
  platforms?: string[]; // Упростим для profileSlice
  genres?: string[];    // Упростим для profileSlice
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
  game_platforms?: Array<{  // Изменено с platforms на game_platforms
    platforms: {
      id: string;
      name: string;
    }
  }>;
  game_genres?: Array<{  // Изменено с genres на game_genres
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

// Добавьте функцию для проверки изображений
export const debugImages = async () => {
  console.log('=== DEBUG IMAGES ===');
  
  const { data: games } = await supabase
    .from('games')
    .select('id, title, image_url')
    .limit(3);
  
  games?.forEach(game => {
    console.log(`Game: ${game.title}`);
    console.log(`  Image URL in DB: "${game.image_url}"`);
    console.log(`  URL type: ${typeof game.image_url}`);
    console.log(`  Is empty: ${!game.image_url}`);
  });
  
  // Проверим конкретную картинку
  const cyberpunkId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const { data: cyberpunk } = await supabase
    .from('games')
    .select('image_url')
    .eq('id', cyberpunkId)
    .single();
  
  console.log('\nCyberpunk image URL:', cyberpunk?.image_url);
  
  // Попробуем создать полный URL
  const bucketUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public`;
  console.log('Bucket base URL:', bucketUrl);
  
  if (cyberpunk?.image_url) {
    const fullUrl = `${bucketUrl}/${cyberpunk.image_url}`;
    console.log('Full image URL:', fullUrl);
    
    // Проверим доступность
    try {
      const response = await fetch(fullUrl, { method: 'HEAD' });
      console.log('Image accessible:', response.ok);
    } catch (e) {
      console.log('Image check error:', e);
    }
  }
};

// Вспомогательная функция для преобразования игры с отношениями в простую игру
const transformGame = (gameWithRelations: any): Game => {
  console.log('Transforming game:', gameWithRelations?.title);
  
  // Извлекаем платформы
  const platforms = gameWithRelations.game_platforms?.map((gp: any) => 
    gp.platforms?.name
  ).filter(Boolean) || [];

  // Извлекаем жанры
  const genres = gameWithRelations.game_genres?.map((gg: any) => 
    gg.genres?.name
  ).filter(Boolean) || [];

  // ОБРАБАТЫВАЕМ IMAGE_URL
  let imageUrl = gameWithRelations.image_url;
  
  // Если путь начинается с 'public/images/', преобразуем в полный URL
  if (imageUrl && imageUrl.startsWith('public/images/')) {
    // Убираем 'public/' из начала
    const cleanPath = imageUrl.replace('public/', '');
    imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${cleanPath}`;
    console.log(`  Converted image URL: ${imageUrl}`);
  } else if (imageUrl && !imageUrl.startsWith('http')) {
    // Если это относительный путь без 'public/'
    imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${imageUrl}`;
  }

  console.log(`  Platforms: ${platforms.join(', ')}`);
  console.log(`  Genres: ${genres.join(', ')}`);

  return {
    id: gameWithRelations.id,
    title: gameWithRelations.title,
    description: gameWithRelations.description,
    image_url: imageUrl, // Теперь это полный URL
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

      if (error) throw error;

      console.log('Filtered games raw:', games);
      // Преобразуем данные
      const transformedGames = games?.map(transformGame) || [];

      return {
        games: transformedGames,
        total: count || 0
      };

    } catch (error: any) {
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

export const testDirectQuery = async () => {
  const testGameId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // Cyberpunk 2077
  
  // Проверяем напрямую через game_platforms
  const { data, error } = await supabase
    .from('game_platforms')
    .select('*')
  
  console.log('Direct query result:', data);
  console.log('Direct query error:', error);
  
  return data;
};

export const debugDatabaseContent = async () => {
  console.log('=== DATABASE DIAGNOSTICS ===');
  
  try {
    // 1. Проверим таблицу games
    const { data: allGames, count: gamesCount } = await supabase
      .from('games')
      .select('id, title', { count: 'exact' })
      .limit(5);
    
    console.log(`Games table has ${gamesCount} entries`);
    console.log('First 5 games:', allGames);
    
    // 2. Проверим таблицу platforms
    const { data: allPlatforms } = await supabase
      .from('platforms')
      .select('*');
    
    console.log(`Platforms:`, allPlatforms);
    
    // 3. Проверим таблицу game_platforms ВСЕ записи
    const { data: allGamePlatforms, count: gpCount } = await supabase
      .from('game_platforms')
      .select('game_id, platform_id', { count: 'exact' });
    
    console.log(`game_platforms has ${gpCount} entries`);
    console.log('All game_platforms entries:', allGamePlatforms);
    
    // 4. Проверим конкретную игру с разными форматами ID
    const cyberpunkId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    
    // Вариант 1: Проверка в таблице games
    const { data: cyberpunkGame } = await supabase
      .from('games')
      .select('*')
      .eq('id', cyberpunkId)
      .single();
    
    console.log('\nCyberpunk game from games table:', cyberpunkGame);
    
    // Вариант 2: Проверка в game_platforms с разными форматами
    console.log('\nChecking game_platforms with different ID formats:');
    
    // С дефисами
    const { data: gp1 } = await supabase
      .from('game_platforms')
      .select('*')
      .eq('game_id', cyberpunkId);
    console.log('With hyphens:', gp1);
    
    // Без дефисов
    const idNoHyphens = cyberpunkId.replace(/-/g, '');
    const { data: gp2 } = await supabase
      .from('game_platforms')
      .select('*')
      .eq('game_id', idNoHyphens);
    console.log('Without hyphens:', gp2);
    
    // В верхнем регистре
    const { data: gp3 } = await supabase
      .from('game_platforms')
      .select('*')
      .eq('game_id', cyberpunkId.toUpperCase());
    console.log('Uppercase:', gp3);
    
    // 5. Проверим RLS политики
    console.log('\n=== RLS CHECK ===');
    const { data: rlsInfo } = await supabase
      .rpc('get_rls_policies'); // Нужно создать эту функцию
    
    console.log('RLS info:', rlsInfo);
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
};

// Получение популярных игр (фичеред)
export const fetchFeaturedGames = createAsyncThunk(
  'games/fetchFeaturedGames',
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      console.log('Fetching featured games...');
      
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
        .order('rating', { ascending: false })
        .limit(limit);

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
  async (limit: number = 6, { rejectWithValue }) => {
    try {
      console.log('Fetching new releases...');
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
        .order('release_date', { ascending: false })
        .limit(limit);

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
    // Добавляем action для обновления списка всех игр
    setAllGames: (state, action: PayloadAction<Game[]>) => {
      state.games = action.payload;
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
  setAllGames
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