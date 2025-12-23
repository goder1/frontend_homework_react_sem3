// src/pages/HomePage.tsx
import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectGamesLoading,
  selectGamesFilters,
  selectAllGames,
  updateFilters,
  fetchAllGames,
} from '../store/slices/gamesSlice';
import GameFilters from '../components/games/GameFilters';
import GameCard from '../components/games/GameCard';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  
  const allGames = useAppSelector(selectAllGames);
  const isLoading = useAppSelector(selectGamesLoading);
  const filters = useAppSelector(selectGamesFilters);
  
  // Функция фильтрации и сортировки игр
  const filterAndSortGames = (games: any[], filters: any) => {
    // Сначала фильтруем
    const filtered = games.filter(game => {
      // Фильтрация по платформам
      if (filters.platforms.length > 0) {
        const gamePlatforms = game.platforms || [];
        const hasPlatform = filters.platforms.some((platform: string) => 
          gamePlatforms.includes(platform)
        );
        if (!hasPlatform) return false;
      }
      
      // Фильтрация по жанрам
      if (filters.genres.length > 0) {
        const gameGenres = game.genres || [];
        const hasGenre = filters.genres.some((genre: string) => 
          gameGenres.includes(genre)
        );
        if (!hasGenre) return false;
      }
      
      // Поиск
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const titleMatch = game.title.toLowerCase().includes(searchLower);
        const descMatch = game.description.toLowerCase().includes(searchLower);
        const genreMatch = game.genres?.some((genre: string) => 
          genre.toLowerCase().includes(searchLower)
        );
        
        if (!titleMatch && !descMatch && !genreMatch) return false;
      }
      
      return true;
    });

    // Затем сортируем
    let sorted = [...filtered];
    
    switch (filters.sortBy) {
      case 'popular':
      case 'rating':
        // Сортировка по рейтингу (убывание)
        sorted.sort((a, b) => b.rating - a.rating);
        break;
        
      case 'newest':
      case 'release':
        // Сортировка по дате релиза (убывание)
        sorted.sort((a, b) => {
          const dateA = new Date(a.release_date).getTime();
          const dateB = new Date(b.release_date).getTime();
          return dateB - dateA;
        });
        break;
        
      case 'title':
        // Сортировка по названию (по возрастанию)
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
        
      default:
        // По умолчанию сортировка по рейтингу
        sorted.sort((a, b) => b.rating - a.rating);
    }
    
    return sorted;
  };
  
  // Используем useMemo для оптимизации
  const filteredGames = useMemo(() => 
    filterAndSortGames(allGames, filters), 
    [allGames, filters]
  );
  
  const popularGames = useMemo(() => 
    filteredGames.slice(0, 6),
    [filteredGames]
  );
  
  const newReleases = useMemo(() => {
    // Для новых релизов всегда сортируем по дате выхода
    const releases = [...filteredGames].sort((a, b) => {
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      return dateB - dateA;
    });
    return releases.slice(0, 6);
  }, [filteredGames]);

  console.log('HomePage render:', {
    allGames: allGames.length,
    filteredGames: filteredGames.length,
    filters,
    popularGames: popularGames.length,
    newReleases: newReleases.length,
    sortBy: filters.sortBy
  });

  // Загружаем все игры при монтировании
  useEffect(() => {
    console.log('HomePage useEffect - loading all games...');
    dispatch(fetchAllGames());
  }, [dispatch]);

  // Обработка фильтров из навигации
  useEffect(() => {
    if (location.state?.filter) {
      const filter = location.state.filter;
      
      if (filter.type === 'genre') {
        dispatch(updateFilters({ 
          genres: [filter.value],
          platforms: []
        }));
      } else if (filter.type === 'platform') {
        dispatch(updateFilters({ 
          platforms: [filter.value],
          genres: []
        }));
      }
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);

  if (isLoading && allGames.length === 0) {
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
      <GameFilters />
      
      <main className={styles.mainContent}>
        <div className="container">
          <section className={styles.featuredGames}>
            <h2>
              {filters.sortBy === 'newest' || filters.sortBy === 'release' 
                ? 'Новые релизы' 
                : 'Популярные игры'
              }
              {filters.platforms.length > 0 && ` на ${filters.platforms.join(', ')}`}
              {filters.genres.length > 0 && ` в жанре ${filters.genres.join(', ')}`}
              {filters.searchQuery && ` по запросу "${filters.searchQuery}"`}
            </h2>
            {filteredGames.length === 0 ? (
              <div className={styles.noResults}>
                <p>Нет игр, соответствующих выбранным фильтрам</p>
              </div>
            ) : (
              <div className={styles.gamesGrid}>
                {popularGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>
          
          <section className={styles.newGames}>
            <h2>Новые релизы</h2>
            {newReleases.length === 0 ? (
              <div className={styles.noResults}>
                <p>Нет игр, соответствующих выбранным фильтрам</p>
              </div>
            ) : (
              <div className={styles.gamesGrid}>
                {newReleases.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;