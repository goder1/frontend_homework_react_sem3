// src/components/games/GameFilters.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  updateFilters, 
  resetFilters,
  selectGamesFilters,
  selectAllGenres,
  selectAllPlatforms 
} from '../../store/slices/gamesSlice';
import { FilterState, Platform } from '../../types/game';
import styles from './GameFilters.module.css';

interface GameFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({ onFilterChange }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectGamesFilters);
  const allGenres = useAppSelector(selectAllGenres);
  const allPlatforms = useAppSelector(selectAllPlatforms);

  const handlePlatformToggle = (platform: Platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    
    dispatch(updateFilters({ platforms: newPlatforms }));
    onFilterChange?.({ ...filters, platforms: newPlatforms });
  };

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    
    dispatch(updateFilters({ genres: newGenres }));
    onFilterChange?.({ ...filters, genres: newGenres });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    dispatch(updateFilters({ sortBy }));
    onFilterChange?.({ ...filters, sortBy });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFilters({ searchQuery: e.target.value }));
    onFilterChange?.({ ...filters, searchQuery: e.target.value });
  };

  const handleReset = () => {
    dispatch(resetFilters());
    onFilterChange?.({
      platforms: [],
      genres: [],
      sortBy: 'popular',
      searchQuery: '',
    });
  };

  return (
    <div className={styles.filtersContainer}>
      <div className="container">
        <div className={styles.filtersContent}>
          <div className={styles.searchSection}>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск игр по названию, описанию или жанру..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filtersSections}>
            <div className={styles.filterSection}>
              <h4>Платформы</h4>
              <div className={styles.platformsGrid}>
                {allPlatforms.map((platform) => (
                  <button
                    key={platform}
                    className={`${styles.platformBtn} ${
                      filters.platforms.includes(platform as Platform) ? styles.active : ''
                    }`}
                    onClick={() => handlePlatformToggle(platform as Platform)}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4>Жанры</h4>
              <div className={styles.genresGrid}>
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    className={`${styles.genreBtn} ${
                      filters.genres.includes(genre) ? styles.active : ''
                    }`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4>Сортировка</h4>
              <div className={styles.sortOptions}>
                <button
                  className={`${styles.sortBtn} ${filters.sortBy === 'popular' ? styles.active : ''}`}
                  onClick={() => handleSortChange('popular')}
                >
                  Популярные
                </button>
                <button
                  className={`${styles.sortBtn} ${filters.sortBy === 'rating' ? styles.active : ''}`}
                  onClick={() => handleSortChange('rating')}
                >
                  По рейтингу
                </button>
                <button
                  className={`${styles.sortBtn} ${filters.sortBy === 'newest' ? styles.active : ''}`}
                  onClick={() => handleSortChange('newest')}
                >
                  Новинки
                </button>
                <button
                  className={`${styles.sortBtn} ${filters.sortBy === 'release' ? styles.active : ''}`}
                  onClick={() => handleSortChange('release')}
                >
                  Дате выхода
                </button>
              </div>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button onClick={handleReset} className={styles.resetBtn}>
              Сбросить фильтры
            </button>
            <div className={styles.activeFilters}>
              {filters.platforms.length > 0 && (
                <span>Платформы: {filters.platforms.join(', ')}</span>
              )}
              {filters.genres.length > 0 && (
                <span>Жанры: {filters.genres.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameFilters;