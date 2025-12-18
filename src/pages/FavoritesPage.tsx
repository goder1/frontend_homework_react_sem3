import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GameCard from '../components/games/GameCard';
import { Game } from '../types/game';
import styles from './FavoritesPage.module.css';

const mockFavorites: Game[] = [
  {
    id: 2,
    title: 'Elden Ring',
    description: 'Фэнтезийная action-RPG от создателей Dark Souls.',
    rating: 4.8,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Action', 'Fantasy'],
    imageUrl: '/images/elden.webp',
    isFavorite: true,
    isInWishlist: false,
    releaseDate: '2022-02-25',
  },
  {
    id: 5,
    title: 'Halo Infinite',
    description: 'Возвращение легендарного Мастера Чифа.',
    rating: 4.3,
    platforms: ['PC', 'Xbox'],
    genres: ['Action', 'FPS'],
    imageUrl: '/images/halo.jpg',
    isFavorite: true,
    isInWishlist: true,
    releaseDate: '2021-12-08',
  },
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Научно-фантастическая RPG в открытом мире от создателей Ведьмака.',
    rating: 4.5,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Action'],
    imageUrl: '/images/cyberpunk.png',
    isFavorite: true,
    isInWishlist: false,
    releaseDate: '2020-12-10',
  },
];

const FavoritesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>(mockFavorites);
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'release'>('rating');
    const navigate = useNavigate();

  const favoriteGames = useMemo(() => {
    const filtered = games.filter(game => game.isFavorite);
    
    switch (sortBy) {
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'name':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case 'release':
        return [...filtered].sort(
          (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      default:
        return filtered;
    }
  }, [games, sortBy]);

  const totalFavorites = favoriteGames.length;
  const averageRating = favoriteGames.length > 0 
    ? favoriteGames.reduce((sum, game) => sum + game.rating, 0) / favoriteGames.length 
    : 0;

  const handleToggleFavorite = (gameId: number) => {
    setGames(games.map(game =>
      game.id === gameId
        ? { ...game, isFavorite: !game.isFavorite }
        : game
    ));
  };

  const handleAddToWishlist = (gameId: number) => {
    setGames(games.map(game =>
      game.id === gameId
        ? { ...game, isInWishlist: !game.isInWishlist }
        : game
    ));
  };

  const handleViewDetails = (gameId: number) => {
    navigate(`/game/${gameId}`);
  };

  const handleClearAll = () => {
    setGames(games.map(game => ({ ...game, isFavorite: false })));
  };

  if (favoriteGames.length === 0) {
    return (
      <div className={styles.favoritesPage}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Избранное</h1>
            <p>Ваши любимые игры появятся здесь</p>
          </div>
          
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎮</div>
            <h3>Пока здесь пусто</h3>
            <p>Добавляйте игры в избранное, нажимая на сердечко ♥</p>
            <Link to="/" className="btn btn-primary">
              Перейти к каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>Избранное</h1>
          <p>Ваша коллекция любимых игр</p>
        </div>

        <div className={styles.favoritesStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{totalFavorites}</div>
            <div className={styles.statLabel}>Всего игр</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{averageRating.toFixed(1)}</div>
            <div className={styles.statLabel}>Средний рейтинг</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {favoriteGames.filter(g => g.isInWishlist).length}
            </div>
            <div className={styles.statLabel}>В желаемом</div>
          </div>
          <div className={styles.statCard}>
            <button 
              className={styles.clearBtn}
              onClick={handleClearAll}
              title="Удалить все из избранного"
            >
              Очистить всё
            </button>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.sortControl}>
            <label htmlFor="sort">Сортировать:</label>
            <select 
              id="sort" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={styles.sortSelect}
            >
              <option value="rating">По рейтингу</option>
              <option value="name">По названию</option>
              <option value="release">По дате выхода</option>
            </select>
          </div>
        </div>

        <div className={styles.gamesGrid}>
          {favoriteGames.map((game) => (
            <div key={game.id} className={styles.gameCardWrapper}>
              <GameCard
                game={game}
                onToggleFavorite={handleToggleFavorite}
                onAddToWishlist={handleAddToWishlist}
                onViewDetails={handleViewDetails}
              />
              {game.isInWishlist && (
                <div className={styles.gameBadge}>
                  В желаемом
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.compatibilitySection}>
          <h3>Совместимость с вашим стилем игры</h3>
          <div className={styles.compatibilityList}>
            {favoriteGames.slice(0, 3).map((game) => {
              const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100%
              return (
                <div key={game.id} className={styles.compatItem}>
                  <span className={styles.gameName}>{game.title}</span>
                  <div className={styles.compatBar}>
                    <div 
                      className={`${styles.compatFill} ${
                        compatibility >= 80 ? styles.high :
                        compatibility >= 60 ? styles.medium :
                        styles.low
                      }`}
                      style={{ width: `${compatibility}%` }}
                    />
                  </div>
                  <span className={styles.compatPercent}>
                    {compatibility}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;