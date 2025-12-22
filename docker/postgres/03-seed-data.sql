DO $$ 
DECLARE
  cyberpunk_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  witcher_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  eldenring_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  gow_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  stray_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  hollow_id UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  
  pc_id UUID := '11111111-1111-1111-1111-111111111111';
  ps_id UUID := '22222222-2222-2222-2222-222222222222';
  xbox_id UUID := '33333333-3333-3333-3333-333333333333';
  switch_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN
  INSERT INTO games (id, title, description, image_url, rating, price, release_date) VALUES
    (cyberpunk_id, 'Cyberpunk 2077', 'Приключение в открытом мире в ночном городе будущего', '/images/cyberpunk.jpg', 4.5, 2999.00, '2020-12-10'),
    (witcher_id, 'The Witcher 3: Wild Hunt', 'Эпическое RPG приключение в мире ведьмака', '/images/witcher3.jpg', 4.9, 1999.00, '2015-05-19'),
    (eldenring_id, 'Elden Ring', 'Фэнтезийное действие с открытым миром от создателей Dark Souls', '/images/elden-ring.jpg', 4.8, 3499.00, '2022-02-25'),
    (gow_id, 'God of War Ragnarök', 'Продолжение эпического приключения Кратоса и Атрея', '/images/god-of-war.jpg', 4.9, 3999.00, '2022-11-09'),
    (stray_id, 'Stray', 'Кошка исследует киберпанк-город', '/images/stray.jpg', 4.3, 1499.00, '2022-07-19'),
    (hollow_id, 'Hollow Knight', 'Исследование подземного королевства насекомых', '/images/hollow-knight.jpg', 4.7, 599.00, '2017-02-24')
  ON CONFLICT (title) DO NOTHING;

  INSERT INTO game_platforms (game_id, platform_id) VALUES
    (cyberpunk_id, pc_id),
    (cyberpunk_id, ps_id),
    (cyberpunk_id, xbox_id),
    (witcher_id, pc_id),
    (witcher_id, ps_id),
    (witcher_id, xbox_id),
    (witcher_id, switch_id),
    (eldenring_id, pc_id),
    (eldenring_id, ps_id),
    (eldenring_id, xbox_id),
    (gow_id, ps_id),
    (stray_id, pc_id),
    (stray_id, ps_id),
    (hollow_id, pc_id),
    (hollow_id, ps_id)
  ON CONFLICT (game_id, platform_id) DO NOTHING;
END $$;

WITH game_ids AS (
  SELECT id, title FROM games
), genre_ids AS (
  SELECT id, name FROM genres
)
INSERT INTO game_genres (game_id, genre_id)
SELECT g.id, ge.id 
FROM game_ids g, genre_ids ge
WHERE (g.title = 'Cyberpunk 2077' AND ge.name IN ('Action', 'RPG', 'Sci-Fi'))
   OR (g.title = 'The Witcher 3: Wild Hunt' AND ge.name IN ('RPG', 'Adventure', 'Fantasy'))
   OR (g.title = 'Elden Ring' AND ge.name IN ('Action', 'RPG', 'Fantasy'))
   OR (g.title = 'God of War Ragnarök' AND ge.name IN ('Action', 'Adventure'))
   OR (g.title = 'Stray' AND ge.name IN ('Adventure', 'Indie'))
   OR (g.title = 'Hollow Knight' AND ge.name IN ('Action', 'Adventure', 'Indie'))
ON CONFLICT (game_id, genre_id) DO NOTHING;

DO $$ 
BEGIN
  RAISE NOTICE '✅ Seed данные успешно загружены!';
  RAISE NOTICE '   Игр: %', (SELECT COUNT(*) FROM games);
  RAISE NOTICE '   Платформ: %', (SELECT COUNT(*) FROM platforms);
  RAISE NOTICE '   Жанров: %', (SELECT COUNT(*) FROM genres);
END $$;

INSERT INTO users (username, email, password_hash, avatar_url) VALUES
  ('testuser', 'test@example.com', '$2a$10$TestHashForDevelopment', '/images/avatar.png')
ON CONFLICT (email) DO NOTHING;

-- Тестовые избранные игры (ссылаемся на users)
INSERT INTO user_favorites (user_id, game_id)
SELECT users.id, games.id 
FROM users, games 
WHERE users.username = 'testuser' 
AND games.title IN ('The Witcher 3: Wild Hunt', 'Elden Ring')
ON CONFLICT (user_id, game_id) DO NOTHING;