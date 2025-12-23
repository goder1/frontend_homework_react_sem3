// src/components/games/GameFilters.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  updateFilters,
  resetFilters,
  selectGamesFilters,
  selectAllGenres,
  selectAllPlatforms,
  FilterState,
} from '../../store/slices/gamesSlice';
import { PlatformType, SortByType } from '../../store/slices/gamesSlice';
import styles from './GameFilters.module.css';

interface GameFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({ onFilterChange }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectGamesFilters);
  const allGenres = useAppSelector(selectAllGenres);
  const allPlatforms = useAppSelector(selectAllPlatforms);

  const handlePlatformToggle = (platform: PlatformType) => {
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

  const handleSortChange = (sortBy: SortByType) => {
    dispatch(updateFilters({ sortBy }));
    onFilterChange?.({ ...filters, sortBy });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(updateFilters({ searchQuery: value }));
    onFilterChange?.({ ...filters, searchQuery: value });
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
                {allPlatforms.map(platform => (
                  <button
                    key={platform}
                    className={`${styles.platformBtn} ${
                      filters.platforms.includes(platform as PlatformType) ? styles.active : ''
                    }`}
                    onClick={() => handlePlatformToggle(platform as PlatformType)}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <h4>Жанры</h4>
              <div className={styles.genresGrid}>
                {allGenres.map(genre => (
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
                  className={`${styles.sortBtn} ${filters.sortBy === 'title' ? styles.active : ''}`}
                  onClick={() => handleSortChange('title')}
                >
                  По названию
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
              {filters.genres.length > 0 && <span>Жанры: {filters.genres.join(', ')}</span>}
              {filters.searchQuery && <span>Поиск: &quot;{filters.searchQuery}&quot;</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameFilters;
