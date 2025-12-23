// src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectFeaturedGames, 
  selectNewReleases,
  selectGamesLoading,
  fetchGames,
  updateFilters,
  fetchFeaturedGames,
  fetchNewReleases,
  testDirectQuery,
  debugDatabaseContent,
  debugImages
} from '../store/slices/gamesSlice';
import GameFilters from '../components/games/GameFilters';
import GameCard from '../components/games/GameCard';
import styles from './HomePage.module.css';

interface FilterState {
  type: 'genre' | 'platform';
  value: string;
}

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  
  const popularGames = useAppSelector(selectFeaturedGames);
  const newReleases = useAppSelector(selectNewReleases);
  const isLoading = useAppSelector(selectGamesLoading);
  
  debugImages();
  
  //testDirectQuery();
  //debugDatabaseContent();
  
  console.log('HomePage render - popularGames:', popularGames);
  console.log('HomePage render - newReleases:', newReleases);
  console.log('HomePage render - isLoading:', isLoading);
  
  console.log('HomePage - First popular game:', popularGames[0]);
  console.log('HomePage - First popular game platforms:', popularGames[0]?.platforms);
  console.log('HomePage - First popular game genres:', popularGames[0]?.genres);
  console.log('HomePage - First popular game image_url:', popularGames[0]?.image_url);

  // Обработчик фильтров
  const handleFilterChange = (filters: any) => {
    console.log('Filter changed:', filters);
  };

  useEffect(() => {
    dispatch(fetchGames());
    console.log('HomePage useEffect - fetching games...');
    // Загружаем обе категории игр
    dispatch(fetchFeaturedGames(6));
    dispatch(fetchNewReleases(6));
  }, [dispatch]);

  // Обработка параметров из навигации
  useEffect(() => {
    if (location.state?.filter) {
      const filter: FilterState = location.state.filter;
      
      if (filter.type === 'genre') {
        dispatch(updateFilters({ 
          genres: [filter.value],
          platforms: [] // Сбрасываем платформы при выборе жанра
        }));
      } else if (filter.type === 'platform') {
        dispatch(updateFilters({ 
          platforms: [filter.value],
          genres: [] // Сбрасываем жанры при выборе платформы
        }));
      }
      
      // Очищаем состояние навигации после применения
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);

  if (isLoading) {
    return (
      <div className={styles.homePage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка игр...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <GameFilters onFilterChange={handleFilterChange} />
      
      <main className={styles.mainContent}>
        <div className="container">
          <section className={styles.featuredGames}>
            <h2>Популярные игры</h2>
            <div className={styles.gamesGrid}>
              {popularGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                />
              ))}
            </div>
          </section>
          
          <section className={styles.newGames}>
            <h2>Новые релизы</h2>
            <div className={styles.gamesGrid}>
              {newReleases.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;