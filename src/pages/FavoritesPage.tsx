// src/pages/FavoritesPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectAllFavorites, 
  selectFavoritesCount, 
  selectFavoritesLoading,
  selectAverageRating,
  loadFavorites
} from '../store/slices/favoritesSlice';
import GameFilters from '../components/games/GameFilters';
import GameCard from '../components/games/GameCard';
import styles from './FavoritesPage.module.css';

const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Получаем данные из Redux
  const favorites = useAppSelector(selectAllFavorites);
  const favoritesCount = useAppSelector(selectFavoritesCount);
  const isLoading = useAppSelector(selectFavoritesLoading);
  const averageRating = useAppSelector(selectAverageRating);

  // Загружаем избранное при монтировании
  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  // Обработчик фильтров
  const handleFilterChange = (filters: any) => {
    // Здесь можно применить фильтры к избранному
    // Пока просто логируем
    console.log('Filter changed:', filters);
  };

  if (isLoading) {
    return (
      <div className={styles.favoritesPage}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Избранное</h1>
            <p>Загрузка ваших избранных игр...</p>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
          </div>
        </div>
      </div>
    );
  }

  if (favoritesCount === 0) {
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
            <Link to="/" className={styles.btnPrimary}>
              Перейти к каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
      <GameFilters onFilterChange={handleFilterChange} />
      
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>Избранное</h1>
          <p>Ваша коллекция любимых игр</p>
        </div>

        <div className={styles.favoritesStats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{favoritesCount}</div>
            <div className={styles.statLabel}>Всего игр</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{averageRating.toFixed(1)}</div>
            <div className={styles.statLabel}>Средний рейтинг</div>
          </div>
        </div>

        <div className={styles.gamesGrid}>
          {favorites.map((game) => (
            <div key={game.id} className={styles.gameCardWrapper}>
              <GameCard
                game={game}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;