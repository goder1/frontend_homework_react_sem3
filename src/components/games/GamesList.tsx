import React from 'react';
import GameFilters from './GameFilters';
import GameCard from './GameCard';
import { Game, FilterState } from '../../types/game';
import styles from './GamesList.module.css';

interface GamesListProps {
  games: Game[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onToggleFavorite?: (id: number) => void;
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  showTitle?: boolean;
}

const GamesList: React.FC<GamesListProps> = ({
  games,
  filters,
  onFilterChange,
  onToggleFavorite,
  title = 'Игры',
  emptyMessage = 'Игры не найдены',
  showFilters = true,
  showTitle = true,
}) => {
  const handleDefaultToggleFavorite = (id: number) => {
    console.log(`Toggle favorite for game ${id}`);
  };

  const handleToggleFavorite = onToggleFavorite || handleDefaultToggleFavorite;

  return (
    <div className={styles.gamesList}>
      {showFilters && (
        <GameFilters onFilterChange={onFilterChange} />
      )}
      
      <div className="container">
        {showTitle && (
          <div className={styles.pageHeader}>
            <h1>{title}</h1>
            {games.length > 0 && (
              <p className={styles.gamesCount}>Найдено игр: {games.length}</p>
            )}
          </div>
        )}
        
        {games.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎮</div>
            <h3>{emptyMessage}</h3>
            <p>Попробуйте изменить параметры фильтров</p>
          </div>
        ) : (
          <div className={styles.gamesGrid}>
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesList;