import React, { useState } from 'react';
import { FilterState, Platform } from '../../types/game';
import styles from './GameFilters.module.css';

interface GameFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

const platforms: Platform[] = ['PC', 'PS5', 'Xbox'];
const genres = ['Action', 'RPG', 'Strategy', 'Adventure', 'FPS', 'Sci-Fi', 'Fantasy', 'Indie'];

const GameFilters: React.FC<GameFiltersProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>('popular');

  const handlePlatformToggle = (platform: Platform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    
    setSelectedPlatforms(newPlatforms);
    onFilterChange({
      platforms: newPlatforms,
      genres: selectedGenres,
      sortBy,
      searchQuery: search,
    });
  };

  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(newGenres);
    onFilterChange({
      platforms: selectedPlatforms,
      genres: newGenres,
      sortBy,
      searchQuery: search,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onFilterChange({
      platforms: selectedPlatforms,
      genres: selectedGenres,
      sortBy,
      searchQuery: value,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FilterState['sortBy'];
    setSortBy(value);
    onFilterChange({
      platforms: selectedPlatforms,
      genres: selectedGenres,
      sortBy: value,
      searchQuery: search,
    });
  };

  return (
    <section className={styles.filtersSection}>
      <div className="container">
        <div className={styles.searchBar}>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Поиск игр по названию..."
          />
          <button className={styles.searchBtn}>Найти</button>
        </div>
        
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <h3>Платформа</h3>
            <div className={styles.filterOptions}>
              {platforms.map((platform) => (
                <label key={platform} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                  />
                  <span className={styles.checkMark}>{platform}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <h3>Жанр</h3>
            <div className={styles.filterOptions}>
              {genres.map((genre) => (
                <label key={genre} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <span className={styles.checkMark}>{genre}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <h3>Сортировка</h3>
            <select value={sortBy} onChange={handleSortChange} className={styles.sortSelect}>
              <option value="popular">По популярности</option>
              <option value="newest">Сначала новые</option>
              <option value="rating">По рейтингу</option>
              <option value="release">По дате выхода</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameFilters;