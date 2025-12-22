//// src/lib/local-database.ts
//import { Pool } from 'pg';
//import bcrypt from 'bcryptjs';
//
//// Типы данных
//export interface User {
//  id: number;
//  username: string;
//  email: string;
//  password_hash: string;
//  display_name?: string;
//  avatar_url?: string;
//  bio?: string;
//  level: number;
//  total_games: number;
//  total_hours: number;
//  favorite_genre?: string;
//  join_date: string;
//  last_login?: string;
//  is_active: boolean;
//  created_at: string;
//  updated_at: string;
//}
//
//export interface Game {
//  id: number;
//  title: string;
//  description: string;
//  image_url: string;
//  rating: number;
//  price?: number;
//  release_date: string;
//  created_at: string;
//  updated_at: string;
//  platforms?: string[];
//  genres?: string[];
//}
//
//export interface UserGame {
//  id: number;
//  user_id: number;
//  game_id: number;
//  user_rating: number;
//  hours_played: number;
//  achievements_completed: number;
//  status: 'playing' | 'completed' | 'on-hold' | 'dropped' | 'planning';
//  notes?: string;
//  last_played: string;
//  created_at: string;
//  updated_at: string;
//  game?: Game;
//}
//
//export interface LoginCredentials {
//  email: string;
//  password: string;
//  rememberMe?: boolean;
//}
//
//export interface RegisterData {
//  username: string;
//  email: string;
//  password: string;
//  confirmPassword?: string;
//  agreeToTerms?: boolean;
//  display_name?: string;
//}
//
//// Конфигурация подключения
//const pool = new Pool({
//  host: process.env.DB_HOST || 'localhost',
//  port: parseInt(process.env.DB_PORT || '5432'),
//  database: process.env.DB_NAME || 'gamecatalog',
//  user: process.env.DB_USER || 'gamecatalog',
//  password: process.env.DB_PASSWORD || 'securepassword123',
//  max: 20,
//  idleTimeoutMillis: 30000,
//  connectionTimeoutMillis: 2000,
//});
//
//// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
//
//// Проверка подключения
//export async function checkConnection(): Promise<boolean> {
//  try {
//    const client = await pool.connect();
//    const result = await client.query('SELECT NOW()');
//    client.release();
//    console.log('✅ Database connection successful');
//    return true;
//  } catch (error) {
//    console.error('❌ Database connection error:', error);
//    return false;
//  }
//}
//
//// Хеширование пароля
//async function hashPassword(password: string): Promise<string> {
//  const saltRounds = 10;
//  return await bcrypt.hash(password, saltRounds);
//}
//
//// Проверка пароля
//async function verifyPassword(password: string, hash: string): Promise<boolean> {
//  return await bcrypt.compare(password, hash);
//}
//
//// ============ ФУНКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ============
//
//// Регистрация нового пользователя
//export async function registerUser(
//  userData: RegisterData
//): Promise<{ user: Omit<User, 'password_hash'>; token?: string }> {
//  const client = await pool.connect();
//  
//  try {
//    // Проверяем существование пользователя с таким email или username
//    const existingUser = await client.query(
//      `SELECT id FROM users WHERE email = $1 OR username = $2`,
//      [userData.email, userData.username]
//    );
//    
//    if (existingUser.rows.length > 0) {
//      throw new Error('Пользователь с таким email или именем уже существует');
//    }
//    
//    // Хешируем пароль
//    const passwordHash = await hashPassword(userData.password);
//    
//    // Создаем пользователя
//    const result = await client.query<User>(
//      `
//      INSERT INTO users (
//        username, email, password_hash, display_name, 
//        join_date, last_login, is_active
//      )
//      VALUES ($1, $2, $3, $4, NOW(), NOW(), true)
//      RETURNING 
//        id, username, email, display_name, avatar_url, bio,
//        level, total_games, total_hours, favorite_genre,
//        join_date, last_login, is_active, created_at, updated_at
//      `,
//      [
//        userData.username,
//        userData.email,
//        passwordHash,
//        userData.display_name || userData.username
//      ]
//    );
//    
//    const user = result.rows[0];
//    
//    // Для упрощения, здесь можно генерировать JWT токен
//    // В реальном приложении используйте jsonwebtoken
//    const token = `local-token-${user.id}-${Date.now()}`;
//    
//    return {
//      user: {
//        ...user,
//        password_hash: undefined as never
//      } as Omit<User, 'password_hash'>,
//      token
//    };
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Авторизация пользователя
//export async function loginUser(
//  credentials: LoginCredentials
//): Promise<{ user: Omit<User, 'password_hash'>; token?: string }> {
//  const client = await pool.connect();
//  
//  try {
//    // Ищем пользователя по email
//    const result = await client.query<User>(
//      `
//      SELECT * FROM users 
//      WHERE email = $1 AND is_active = true
//      `,
//      [credentials.email]
//    );
//    
//    if (result.rows.length === 0) {
//      throw new Error('Пользователь не найден');
//    }
//    
//    const user = result.rows[0];
//    
//    // Проверяем пароль
//    const isValidPassword = await verifyPassword(credentials.password, user.password_hash);
//    
//    if (!isValidPassword) {
//      throw new Error('Неверный пароль');
//    }
//    
//    // Обновляем last_login
//    await client.query(
//      `UPDATE users SET last_login = NOW() WHERE id = $1`,
//      [user.id]
//    );
//    
//    // Генерируем токен
//    const token = `local-token-${user.id}-${Date.now()}`;
//    
//    return {
//      user: {
//        ...user,
//        password_hash: undefined as never
//      } as Omit<User, 'password_hash'>,
//      token
//    };
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Получение пользователя по ID
//export async function getUserById(userId: number): Promise<Omit<User, 'password_hash'> | null> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<User>(
//      `
//      SELECT 
//        id, username, email, display_name, avatar_url, bio,
//        level, total_games, total_hours, favorite_genre,
//        join_date, last_login, is_active, created_at, updated_at
//      FROM users 
//      WHERE id = $1 AND is_active = true
//      `,
//      [userId]
//    );
//    
//    return result.rows[0] || null;
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Обновление профиля пользователя
//export async function updateUserProfile(
//  userId: number,
//  updates: {
//    display_name?: string;
//    avatar_url?: string;
//    bio?: string;
//    favorite_genre?: string;
//  }
//): Promise<Omit<User, 'password_hash'>> {
//  const client = await pool.connect();
//  
//  try {
//    // Формируем динамический запрос на основе переданных полей
//    const fields = [];
//    const values = [];
//    let paramIndex = 1;
//    
//    if (updates.display_name !== undefined) {
//      fields.push(`display_name = $${paramIndex}`);
//      values.push(updates.display_name);
//      paramIndex++;
//    }
//    
//    if (updates.avatar_url !== undefined) {
//      fields.push(`avatar_url = $${paramIndex}`);
//      values.push(updates.avatar_url);
//      paramIndex++;
//    }
//    
//    if (updates.bio !== undefined) {
//      fields.push(`bio = $${paramIndex}`);
//      values.push(updates.bio);
//      paramIndex++;
//    }
//    
//    if (updates.favorite_genre !== undefined) {
//      fields.push(`favorite_genre = $${paramIndex}`);
//      values.push(updates.favorite_genre);
//      paramIndex++;
//    }
//    
//    if (fields.length === 0) {
//      throw new Error('Нет полей для обновления');
//    }
//    
//    values.push(userId);
//    
//    const result = await client.query<User>(
//      `
//      UPDATE users 
//      SET ${fields.join(', ')}
//      WHERE id = $${paramIndex} AND is_active = true
//      RETURNING 
//        id, username, email, display_name, avatar_url, bio,
//        level, total_games, total_hours, favorite_genre,
//        join_date, last_login, is_active, created_at, updated_at
//      `,
//      values
//    );
//    
//    if (result.rows.length === 0) {
//      throw new Error('Пользователь не найден');
//    }
//    
//    return result.rows[0];
//    
//  } finally {
//    client.release();
//  }
//}
//
//// ============ ФУНКЦИИ ДЛЯ ИГР ============
//
//// Получение всех игр с пагинацией и фильтрацией
//export async function getGames(options?: {
//  page?: number;
//  limit?: number;
//  search?: string;
//  platforms?: string[];
//  genres?: string[];
//  sortBy?: 'rating' | 'release_date' | 'title';
//  sortOrder?: 'asc' | 'desc';
//}): Promise<{ games: Game[]; total: number }> {
//  const client = await pool.connect();
//  
//  try {
//    const {
//      page = 1,
//      limit = 20,
//      search = '',
//      platforms = [],
//      genres = [],
//      sortBy = 'rating',
//      sortOrder = 'desc'
//    } = options || {};
//    
//    const offset = (page - 1) * limit;
//    
//    // Формируем WHERE условия
//    const whereConditions = [];
//    const queryParams = [];
//    let paramIndex = 1;
//    
//    if (search) {
//      whereConditions.push(`(g.title ILIKE $${paramIndex} OR g.description ILIKE $${paramIndex})`);
//      queryParams.push(`%${search}%`);
//      paramIndex++;
//    }
//    
//    if (platforms.length > 0) {
//      const platformConditions = platforms.map((_, idx) => `p.name = $${paramIndex + idx}`);
//      whereConditions.push(`(${platformConditions.join(' OR ')})`);
//      queryParams.push(...platforms);
//      paramIndex += platforms.length;
//    }
//    
//    if (genres.length > 0) {
//      const genreConditions = genres.map((_, idx) => `gr.name = $${paramIndex + idx}`);
//      whereConditions.push(`(${genreConditions.join(' OR ')})`);
//      queryParams.push(...genres);
//      paramIndex += genres.length;
//    }
//    
//    // Формируем JOIN условия для платформ и жанров
//    const joins = [];
//    if (platforms.length > 0) {
//      joins.push(`JOIN game_platforms gp ON g.id = gp.game_id`);
//      joins.push(`JOIN platforms p ON gp.platform_id = p.id`);
//    }
//    
//    if (genres.length > 0) {
//      joins.push(`JOIN game_genres gg ON g.id = gg.game_id`);
//      joins.push(`JOIN genres gr ON gg.genre_id = gr.id`);
//    }
//    
//    const whereClause = whereConditions.length > 0 
//      ? `WHERE ${whereConditions.join(' AND ')}` 
//      : '';
//    
//    // Получаем игры
//    const gamesQuery = await client.query<Game>(
//      `
//      SELECT 
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM games g
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      ${whereClause}
//      GROUP BY g.id
//      ORDER BY g.${sortBy} ${sortOrder}
//      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//      `,
//      [...queryParams, limit, offset]
//    );
//    
//    // Получаем общее количество
//    const countQuery = await client.query(
//      `
//      SELECT COUNT(DISTINCT g.id) as total
//      FROM games g
//      ${joins.join(' ')}
//      ${whereClause}
//      `,
//      queryParams
//    );
//    
//    return {
//      games: gamesQuery.rows,
//      total: parseInt(countQuery.rows[0].total)
//    };
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Получение игры по ID
//export async function getGameById(id: number): Promise<Game | null> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<Game>(
//      `
//      SELECT 
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM games g
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      WHERE g.id = $1
//      GROUP BY g.id
//      `,
//      [id]
//    );
//    
//    return result.rows[0] || null;
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Получение популярных игр
//export async function getPopularGames(limit: number = 6): Promise<Game[]> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<Game>(
//      `
//      SELECT 
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM games g
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      GROUP BY g.id
//      ORDER BY g.rating DESC
//      LIMIT $1
//      `,
//      [limit]
//    );
//    
//    return result.rows;
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Получение новых релизов
//export async function getNewReleases(limit: number = 6): Promise<Game[]> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<Game>(
//      `
//      SELECT 
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM games g
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      GROUP BY g.id
//      ORDER BY g.release_date DESC
//      LIMIT $1
//      `,
//      [limit]
//    );
//    
//    return result.rows;
//    
//  } finally {
//    client.release();
//  }
//}
//
//// ============ ФУНКЦИИ ДЛЯ ИЗБРАННОГО ============
//
//// Добавление игры в избранное
//export async function addToFavorites(userId: number, gameId: number): Promise<void> {
//  const client = await pool.connect();
//  
//  try {
//    await client.query(
//      `
//      INSERT INTO user_favorites (user_id, game_id)
//      VALUES ($1, $2)
//      ON CONFLICT (user_id, game_id) DO NOTHING
//      `,
//      [userId, gameId]
//    );
//  } finally {
//    client.release();
//  }
//}
//
//// Удаление игры из избранного
//export async function removeFromFavorites(userId: number, gameId: number): Promise<void> {
//  const client = await pool.connect();
//  
//  try {
//    await client.query(
//      `
//      DELETE FROM user_favorites 
//      WHERE user_id = $1 AND game_id = $2
//      `,
//      [userId, gameId]
//    );
//  } finally {
//    client.release();
//  }
//}
//
//// Получение избранных игр пользователя
//export async function getUserFavorites(userId: number): Promise<Game[]> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<Game>(
//      `
//      SELECT 
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM user_favorites uf
//      JOIN games g ON uf.game_id = g.id
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      WHERE uf.user_id = $1
//      GROUP BY g.id
//      ORDER BY uf.created_at DESC
//      `,
//      [userId]
//    );
//    
//    return result.rows;
//  } finally {
//    client.release();
//  }
//}
//
//// Проверка, находится ли игра в избранном
//export async function isGameInFavorites(userId: number, gameId: number): Promise<boolean> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query(
//      `
//      SELECT 1 FROM user_favorites 
//      WHERE user_id = $1 AND game_id = $2
//      `,
//      [userId, gameId]
//    );
//    
//    return result.rows.length > 0;
//  } finally {
//    client.release();
//  }
//}
//
//// ============ ФУНКЦИИ ДЛЯ КОЛЛЕКЦИИ ИГР ============
//
//// Добавление игры в коллекцию пользователя
//export async function addGameToCollection(
//  userId: number,
//  gameData: {
//    gameId: number;
//    userRating?: number;
//    hoursPlayed?: number;
//    achievementsCompleted?: number;
//    status?: 'playing' | 'completed' | 'on-hold' | 'dropped' | 'planning';
//    notes?: string;
//  }
//): Promise<UserGame> {
//  const client = await pool.connect();
//  
//  try {
//    const result = await client.query<UserGame>(
//      `
//      INSERT INTO user_games (
//        user_id, game_id, user_rating, hours_played, 
//        achievements_completed, status, notes, last_played
//      )
//      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
//      ON CONFLICT (user_id, game_id) DO UPDATE SET
//        user_rating = EXCLUDED.user_rating,
//        hours_played = EXCLUDED.hours_played,
//        achievements_completed = EXCLUDED.achievements_completed,
//        status = EXCLUDED.status,
//        notes = EXCLUDED.notes,
//        last_played = NOW()
//      RETURNING *
//      `,
//      [
//        userId,
//        gameData.gameId,
//        gameData.userRating || 0,
//        gameData.hoursPlayed || 0,
//        gameData.achievementsCompleted || 0,
//        gameData.status || 'playing',
//        gameData.notes || null
//      ]
//    );
//    
//    return result.rows[0];
//  } finally {
//    client.release();
//  }
//}
//
//// Обновление игры в коллекции
//export async function updateGameInCollection(
//  userGameId: number,
//  updates: {
//    userRating?: number;
//    hoursPlayed?: number;
//    achievementsCompleted?: number;
//    status?: 'playing' | 'completed' | 'on-hold' | 'dropped' | 'planning';
//    notes?: string;
//  }
//): Promise<UserGame> {
//  const client = await pool.connect();
//  
//  try {
//    const fields = [];
//    const values = [];
//    let paramIndex = 1;
//    
//    if (updates.userRating !== undefined) {
//      fields.push(`user_rating = $${paramIndex}`);
//      values.push(updates.userRating);
//      paramIndex++;
//    }
//    
//    if (updates.hoursPlayed !== undefined) {
//      fields.push(`hours_played = $${paramIndex}`);
//      values.push(updates.hoursPlayed);
//      paramIndex++;
//    }
//    
//    if (updates.achievementsCompleted !== undefined) {
//      fields.push(`achievements_completed = $${paramIndex}`);
//      values.push(updates.achievementsCompleted);
//      paramIndex++;
//    }
//    
//    if (updates.status !== undefined) {
//      fields.push(`status = $${paramIndex}`);
//      values.push(updates.status);
//      paramIndex++;
//    }
//    
//    if (updates.notes !== undefined) {
//      fields.push(`notes = $${paramIndex}`);
//      values.push(updates.notes);
//      paramIndex++;
//    }
//    
//    if (fields.length === 0) {
//      throw new Error('Нет полей для обновления');
//    }
//    
//    // Добавляем last_played и updated_at
//    fields.push(`last_played = NOW()`);
//    
//    values.push(userGameId);
//    
//    const result = await client.query<UserGame>(
//      `
//      UPDATE user_games 
//      SET ${fields.join(', ')}
//      WHERE id = $${paramIndex}
//      RETURNING *
//      `,
//      values
//    );
//    
//    if (result.rows.length === 0) {
//      throw new Error('Игра не найдена в коллекции');
//    }
//    
//    return result.rows[0];
//  } finally {
//    client.release();
//  }
//}
//
//// Удаление игры из коллекции
//export async function removeGameFromCollection(userGameId: number): Promise<void> {
//  const client = await pool.connect();
//  
//  try {
//    await client.query(
//      `DELETE FROM user_games WHERE id = $1`,
//      [userGameId]
//    );
//  } finally {
//    client.release();
//  }
//}
//
//// Получение коллекции игр пользователя
//export async function getUserGames(
//  userId: number,
//  options?: {
//    page?: number;
//    limit?: number;
//    status?: string;
//    search?: string;
//  }
//): Promise<{ games: UserGame[]; total: number }> {
//  const client = await pool.connect();
//  
//  try {
//    const {
//      page = 1,
//      limit = 20,
//      status,
//      search = ''
//    } = options || {};
//    
//    const offset = (page - 1) * limit;
//    
//    const whereConditions = ['ug.user_id = $1'];
//    const queryParams = [userId];
//    let paramIndex = 2;
//    
//    if (status) {
//      whereConditions.push(`ug.status = $${paramIndex}`);
//      queryParams.push(status);
//      paramIndex++;
//    }
//    
//    if (search) {
//      whereConditions.push(`g.title ILIKE $${paramIndex}`);
//      queryParams.push(`%${search}%`);
//      paramIndex++;
//    }
//    
//    const whereClause = whereConditions.length > 0 
//      ? `WHERE ${whereConditions.join(' AND ')}` 
//      : '';
//    
//    // Получаем игры с пагинацией
//    const gamesQuery = await client.query<{ ug: UserGame; g: Game; platforms: string[]; genres: string[] }>(
//      `
//      SELECT 
//        ug.*,
//        g.*,
//        array_agg(DISTINCT p.name) as platforms,
//        array_agg(DISTINCT gr.name) as genres
//      FROM user_games ug
//      JOIN games g ON ug.game_id = g.id
//      LEFT JOIN game_platforms gp ON g.id = gp.game_id
//      LEFT JOIN platforms p ON gp.platform_id = p.id
//      LEFT JOIN game_genres gg ON g.id = gg.game_id
//      LEFT JOIN genres gr ON gg.genre_id = gr.id
//      ${whereClause}
//      GROUP BY ug.id, g.id
//      ORDER BY ug.last_played DESC
//      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//      `,
//      [...queryParams, limit, offset]
//    );
//    
//    // Преобразуем результат
//    const games = gamesQuery.rows.map(row => ({
//      ...row.ug,
//      game: {
//        ...row.g,
//        platforms: row.platforms,
//        genres: row.genres
//      }
//    }));
//    
//    // Получаем общее количество
//    const countQuery = await client.query(
//      `
//      SELECT COUNT(*) as total
//      FROM user_games ug
//      JOIN games g ON ug.game_id = g.id
//      ${whereClause}
//      `,
//      queryParams
//    );
//    
//    return {
//      games,
//      total: parseInt(countQuery.rows[0].total)
//    };
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Получение статистики пользователя
//export async function getUserStats(userId: number): Promise<{
//  totalGames: number;
//  totalHours: number;
//  averageRating: number;
//  gamesByStatus: Record<string, number>;
//  favoriteGenre?: string;
//  completionRate: number;
//}> {
//  const client = await pool.connect();
//  
//  try {
//    // Общая статистика
//    const statsQuery = await client.query(
//      `
//      SELECT 
//        COUNT(*) as total_games,
//        COALESCE(SUM(hours_played), 0) as total_hours,
//        COALESCE(AVG(user_rating), 0) as average_rating,
//        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games
//      FROM user_games
//      WHERE user_id = $1
//      `,
//      [userId]
//    );
//    
//    // Статистика по статусам
//    const statusQuery = await client.query(
//      `
//      SELECT status, COUNT(*) as count
//      FROM user_games
//      WHERE user_id = $1
//      GROUP BY status
//      `,
//      [userId]
//    );
//    
//    // Любимый жанр
//    const genreQuery = await client.query(
//      `
//      SELECT gr.name, COUNT(*) as count
//      FROM user_games ug
//      JOIN games g ON ug.game_id = g.id
//      JOIN game_genres gg ON g.id = gg.game_id
//      JOIN genres gr ON gg.genre_id = gr.id
//      WHERE ug.user_id = $1
//      GROUP BY gr.name
//      ORDER BY count DESC
//      LIMIT 1
//      `,
//      [userId]
//    );
//    
//    const stats = statsQuery.rows[0];
//    const gamesByStatus: Record<string, number> = {};
//    
//    statusQuery.rows.forEach(row => {
//      gamesByStatus[row.status] = parseInt(row.count);
//    });
//    
//    const totalGames = parseInt(stats.total_games) || 0;
//    const completedGames = parseInt(stats.completed_games) || 0;
//    const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
//    
//    return {
//      totalGames,
//      totalHours: parseInt(stats.total_hours) || 0,
//      averageRating: parseFloat(stats.average_rating) || 0,
//      gamesByStatus,
//      favoriteGenre: genreQuery.rows[0]?.name,
//      completionRate
//    };
//    
//  } finally {
//    client.release();
//  }
//}
//
//// Экспорт pool для других функций
//export { pool };