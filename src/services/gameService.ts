// src/services/gameService.ts
// @ts-ignore
import { supabase } from '../lib/supabaseClient';

export interface GameFilters {
  search?: string;
  platforms?: string[];
  genres?: string[];
  sortBy?: 'rating' | 'release_date' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class GameService {
  // Получение игр с фильтрами
  static async getGames(filters: GameFilters = {}) {
    const { page = 1, limit = 12, search = '', sortBy = 'rating', sortOrder = 'desc' } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('games').select(
      `
        *,
        platforms:game_platforms(platforms(*)),
        genres:game_genres(genres(*))
      `,
      { count: 'exact' }
    );

    // Фильтрация
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Пагинация
    const { data: games, error, count } = await query.range(from, to);

    if (error) throw error;

    return {
      games: games || [],
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 1,
    };
  }

  // Получение игры по ID
  static async getGameById(id: string) {
    const { data: game, error } = await supabase
      .from('games')
      .select(
        `
        *,
        platforms:game_platforms(platforms(*)),
        genres:game_genres(genres(*))
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return game;
  }

  // Получение популярных игр
  static async getPopularGames(limit: number = 6) {
    const { data: games, error } = await supabase
      .from('games')
      .select(
        `
        *,
        platforms:game_platforms(platforms(*)),
        genres:game_genres(genres(*))
      `
      )
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return games || [];
  }

  // Получение новых релизов
  static async getNewReleases(limit: number = 6) {
    const { data: games, error } = await supabase
      .from('games')
      .select(
        `
        *,
        platforms:game_platforms(platforms(*)),
        genres:game_genres(genres(*))
      `
      )
      .order('release_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return games || [];
  }

  // Добавление/удаление из избранного
  static async toggleFavorite(gameId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Не авторизован');

    // Проверяем, есть ли уже в избранном
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single();

    if (existing) {
      // Удаляем
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId);

      if (error) throw error;
      return { isFavorite: false };
    } else {
      // Добавляем
      const { error } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        game_id: gameId,
      });

      if (error) throw error;
      return { isFavorite: true };
    }
  }

  // Проверка, в избранном ли игра
  static async isFavorite(gameId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single();

    return !!data;
  }

  // Получение избранных игр пользователя
  static async getFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(
        `
        created_at,
        games(*)
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (favorites || []).map((item: any) => item.games);
  }
}

export default GameService;
