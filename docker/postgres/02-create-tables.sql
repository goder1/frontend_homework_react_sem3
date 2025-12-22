-- 1. Таблица игр (используем UUID вместо SERIAL)
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

-- 2. Таблица платформ
CREATE TABLE IF NOT EXISTS platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Связь игр и платформ
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (game_id, platform_id)
);

-- 4. Таблица жанров
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Связь игр и жанров
CREATE TABLE IF NOT EXISTS game_genres (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (game_id, genre_id)
);

-- 6. Таблица пользователей (независимая, с хешами паролей)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Избранные игры пользователя
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, game_id)
);

-- 8. Игры пользователя (коллекция)
CREATE TABLE IF NOT EXISTS user_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- 9. Вставляем начальные данные (используем фиксированные UUID для ссылок)
DO $$ 
DECLARE
  pc_id UUID := '11111111-1111-1111-1111-111111111111';
  ps_id UUID := '22222222-2222-2222-2222-222222222222';
  xbox_id UUID := '33333333-3333-3333-3333-333333333333';
  switch_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
  INSERT INTO platforms (id, name) VALUES 
    (pc_id, 'PC'),
    (ps_id, 'PlayStation'),
    (xbox_id, 'Xbox'),
    (switch_id, 'Nintendo Switch')
  ON CONFLICT (name) DO NOTHING;
END $$;

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

-- 10. Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_games_updated_at 
  BEFORE UPDATE ON games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_games_updated_at 
  BEFORE UPDATE ON user_games 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating DESC);
CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 12. Включаем Row Level Security (RLS) для таблиц
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- 13. Базовые политики RLS (можно расширить позже)
-- Игры видны всем
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);

-- Платформы и жанры видны всем
CREATE POLICY "Platforms are viewable by everyone" ON platforms
  FOR SELECT USING (true);
  
CREATE POLICY "Genres are viewable by everyone" ON genres
  FOR SELECT USING (true);

-- Пользователи: временно отключаем сложные политики
-- Для учебного проекта проще пока отключить RLS или сделать простые политики
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);
  
CREATE POLICY "Favorites are viewable by everyone" ON user_favorites
  FOR SELECT USING (true);
  
CREATE POLICY "User games are viewable by everyone" ON user_games
  FOR SELECT USING (true);

-- ИЛИ ПРОЩЕ: временно отключить RLS для разработки
-- COMMENT: Раскомментируйте, если хотите отключить RLS
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_games DISABLE ROW LEVEL SECURITY;

-- 14. Создание тестового пользователя (пароль: test123)
INSERT INTO users (username, email, password_hash, avatar_url) VALUES
  ('testuser', 'test@example.com', '$2b$10$TestHashForDevelopmentOnly', '/images/avatar.png')
ON CONFLICT (email) DO NOTHING;