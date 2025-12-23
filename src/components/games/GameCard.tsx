// src/components/games/GameCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectIsFavorite, toggleFavoriteSync } from '../../store/slices/favoritesSlice';
import { Game } from '../../types/game';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  onViewDetails?: (id: string) => void; // Сделаем опциональным
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Получаем состояние избранного из Redux
  const isFavorite = useAppSelector(selectIsFavorite(game.id));

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteSync({ 
      game, 
      isFavorite 
    }));
  };

  const handleViewDetails = () => {
    // Если передана кастомная функция - используем её
    if (onViewDetails) {
      onViewDetails(game.id);
    } else {
      // Иначе используем стандартную навигацию
      navigate(`/game/${game.id}`);
    }
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameImage}>
        <img src={game.image_url} alt={game.title} />
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          ♥
        </button>
        <div className={styles.gameRating}>{game.rating.toFixed(1)}</div>
      </div>
      
      <div className={styles.gameInfo}>
        <h3>{game.title}</h3>
        
        <div className={styles.gameMeta}>
          {game.platforms?.map((platform) => (
            <span 
              key={platform} 
              className={`${styles.platform} ${styles[platform.toLowerCase()]}`}
            >
              {platform}
            </span>
          ))}
        </div>
        
        <div className={styles.gameGenres}>
          {game.genres?.map((genre) => (
            <span key={genre} className={styles.genre}>
              {genre}
            </span>
          ))}
        </div>
        
        <p className={styles.gameDescription}>{game.description}</p>
        
        <div className={styles.gameActions}>
          <button
            className={`${styles.btn} ${styles.detailsBtn}`}
            onClick={handleViewDetails}
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;