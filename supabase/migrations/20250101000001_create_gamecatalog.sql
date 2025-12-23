-- supabase/migrations/20250101000001_create_gamecatalog_tables.sql
-- Миграция для GameCatalog: создание таблиц и заполнение данными

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Таблица игр
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  price DECIMAL(10, 2),
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE games ADD COLUMN IF NOT EXISTS achievements INTEGER DEFAULT 0;

-- Таблица платформ
CREATE TABLE IF NOT EXISTS platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Связь игр и платформ
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (game_id, platform_id)
);

-- Таблица жанров
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Связь игр и жанров
CREATE TABLE IF NOT EXISTS game_genres (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (game_id, genre_id)
);

-- Таблица пользователей (будет использоваться Supabase Auth)
-- Создадим профили пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Избранные игры пользователя
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, game_id)
);

-- Игры пользователя (коллекция)
CREATE TABLE IF NOT EXISTS user_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_rating INTEGER CHECK (user_rating >= 0 AND user_rating <= 5),
  hours_played INTEGER DEFAULT 0,
  achievements_completed INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('playing', 'completed', 'on-hold', 'dropped', 'planning')),
  notes TEXT,
  last_played TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, game_id)
);

-- Вставляем платформы с фиксированными UUID для связей
INSERT INTO platforms (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'PC'),
  ('22222222-2222-2222-2222-222222222222', 'PlayStation'),
  ('33333333-3333-3333-3333-333333333333', 'Xbox'),
  ('44444444-4444-4444-4444-444444444444', 'Nintendo Switch')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Вставляем жанры
INSERT INTO genres (name) VALUES 
  ('Action'),
  ('RPG'),
  ('Strategy'),
  ('Adventure'),
  ('Shooter'),
  ('Simulation'),
  ('Sports'),
  ('Horror'),
  ('Indie'),
  ('Fantasy'),
  ('Sci-Fi')
ON CONFLICT (name) DO NOTHING;

-- Вставляем игры
INSERT INTO games (id, title, description, image_url, rating, price, release_date) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cyberpunk 2077', 'Приключение в открытом мире в ночном городе будущего', '/images/cyberpunk.jpg', 4.5, 2999.00, '2020-12-10'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'The Witcher 3: Wild Hunt', 'Эпическое RPG приключение в мире ведьмака', '/images/witcher3.jpg', 4.9, 1999.00, '2015-05-19'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Elden Ring', 'Фэнтезийное действие с открытым миром от создателей Dark Souls', '/images/elden-ring.jpg', 4.8, 3499.00, '2022-02-25'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'God of War Ragnarök', 'Продолжение эпического приключения Кратоса и Атрея', '/images/god-of-war.jpg', 4.9, 3999.00, '2022-11-09'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Stray', 'Кошка исследует киберпанк-город', '/images/stray.jpg', 4.3, 1499.00, '2022-07-19'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Hollow Knight', 'Исследование подземного королевства насекомых', '/images/hollow-knight.jpg', 4.7, 599.00, '2017-02-24'),
  ('11111111-1111-1111-1111-111111111112', 'Baldur''s Gate 3', 'Эпическая RPG с глубоким сюжетом и тактическими боями', '/images/baldurs-gate-3.jpg', 4.9, 3499.00, '2023-08-03'),
  ('22222222-2222-2222-2222-222222222223', 'Red Dead Redemption 2', 'История бандита в диком западе', '/images/rdr2.jpg', 4.8, 2499.00, '2018-10-26'),
  ('33333333-3333-3333-3333-333333333334', 'The Legend of Zelda: Breath of the Wild', 'Приключение в открытом мире Хайрула', '/images/zelda-botw.jpg', 4.9, 3999.00, '20173-03-03'),
  ('44444444-4444-4444-4444-444444444445', 'Portal 2', 'Головоломка с порталами и черным юмором', '/images/portal2.jpg', 4.8, 799.00, '2011-04-19'),
  ('55555555-5555-5555-5555-555555555556', 'Half-Life: Alyx', 'VR-шуттер от Valve', '/images/half-life-alyx.jpg', 4.7, 1999.00, '2020-03-23'),
  ('66666666-6666-6666-6666-666666666667', 'Disco Elysium', 'Детектив-RPG с уникальным стилем', '/images/disco-elysium.jpg', 4.6, 1499.00, '2019-10-15')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  price = EXCLUDED.price,
  release_date = EXCLUDED.release_date;

-- Связываем игры с платформами
-- Cyberpunk 2077: PC, PlayStation, Xbox
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'), -- PC
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333')  -- Xbox
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- The Witcher 3: PC, PlayStation, Xbox, Switch
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'), -- PC
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'), -- Xbox
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444')  -- Switch
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Elden Ring: PC, PlayStation, Xbox
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111'), -- PC
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333')  -- Xbox
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- God of War Ragnarök: PlayStation
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222') -- PlayStation
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Stray: PC, PlayStation
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111'), -- PC
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222') -- PlayStation
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Hollow Knight: PC, PlayStation, Switch
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111'), -- PC
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444')  -- Switch
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Baldur's Gate 3: PC, PlayStation, Xbox
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111'), -- PC
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333333')  -- Xbox
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Red Dead Redemption 2: PC, PlayStation, Xbox
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111'), -- PC
  ('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333333')  -- Xbox
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- The Legend of Zelda: Breath of the Wild: Switch
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('33333333-3333-3333-3333-333333333334', '44444444-4444-4444-4444-444444444444')  -- Switch
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Portal 2: PC, PlayStation, Xbox
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111'), -- PC
  ('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333333')  -- Xbox
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Half-Life: Alyx: PC (VR)
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('55555555-5555-5555-5555-555555555556', '11111111-1111-1111-1111-111111111111')  -- PC
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Disco Elysium: PC, PlayStation, Xbox, Switch
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('66666666-6666-6666-6666-666666666667', '11111111-1111-1111-1111-111111111111'), -- PC
  ('66666666-6666-6666-6666-666666666667', '22222222-2222-2222-2222-222222222222'), -- PlayStation
  ('66666666-6666-6666-6666-666666666667', '33333333-3333-3333-3333-333333333333'), -- Xbox
  ('66666666-6666-6666-6666-666666666667', '44444444-4444-4444-4444-444444444444')  -- Switch
ON CONFLICT (game_id, platform_id) DO NOTHING;

-- Связываем игры с жанрами (используем подзапросы для получения ID жанров)
-- Cyberpunk 2077: Action, RPG, Sci-Fi
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  id 
FROM genres 
WHERE name IN ('Action', 'RPG', 'Sci-Fi')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- The Witcher 3: RPG, Adventure, Fantasy
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  id 
FROM genres 
WHERE name IN ('RPG', 'Adventure', 'Fantasy')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Elden Ring: Action, RPG, Fantasy
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  id 
FROM genres 
WHERE name IN ('Action', 'RPG', 'Fantasy')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- God of War Ragnarök: Action, Adventure
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  id 
FROM genres 
WHERE name IN ('Action', 'Adventure')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Stray: Adventure, Indie
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  id 
FROM genres 
WHERE name IN ('Adventure', 'Indie')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Hollow Knight: Action, Adventure, Indie
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  id 
FROM genres 
WHERE name IN ('Action', 'Adventure', 'Indie')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Baldur's Gate 3: RPG, Adventure, Strategy
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '11111111-1111-1111-1111-111111111112',
  id 
FROM genres 
WHERE name IN ('RPG', 'Adventure', 'Strategy')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Red Dead Redemption 2: Action, Adventure
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '22222222-2222-2222-2222-222222222223',
  id 
FROM genres 
WHERE name IN ('Action', 'Adventure')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Zelda BOTW: Adventure, Action
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '33333333-3333-3333-3333-333333333334',
  id 
FROM genres 
WHERE name IN ('Adventure', 'Action')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Portal 2: Puzzle, Adventure (добавим как Adventure)
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '44444444-4444-4444-4444-444444444445',
  id 
FROM genres 
WHERE name IN ('Adventure')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Half-Life Alyx: Shooter, Adventure, Sci-Fi
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '55555555-5555-5555-5555-555555555556',
  id 
FROM genres 
WHERE name IN ('Shooter', 'Adventure', 'Sci-Fi')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Disco Elysium: RPG, Adventure
INSERT INTO game_genres (game_id, genre_id) 
SELECT 
  '66666666-6666-6666-6666-666666666667',
  id 
FROM genres 
WHERE name IN ('RPG', 'Adventure')
ON CONFLICT (game_id, genre_id) DO NOTHING;

-- Функция для автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/images/default-avatar.png')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Включаем RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Политики RLS
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Platforms are viewable by everyone" ON platforms FOR SELECT USING (true);
CREATE POLICY "Genres are viewable by everyone" ON genres FOR SELECT USING (true);

-- Пользователи видят только свои данные
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own games" ON user_games
  FOR ALL USING (auth.uid() = user_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для обновления updated_at
CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_games_updated_at 
  BEFORE UPDATE ON user_games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();