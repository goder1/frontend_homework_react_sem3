import React from 'react';
import { useNavigate } from 'react-router-dom'; // Добавьте этот импорт
import { Game } from '../../types/game';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  onToggleFavorite: (id: number) => void;
  onAddToWishlist: (id: number) => void;
  onViewDetails?: (id: number) => void; // Сделаем опциональным
}

const GameCard: React.FC<GameCardProps> = ({
  game,
  onToggleFavorite,
  onAddToWishlist,
  onViewDetails,
}) => {
  const navigate = useNavigate(); // Хук для навигации

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
        <img src={game.imageUrl} alt={game.title} />
        <button
          className={`${styles.favoriteBtn} ${game.isFavorite ? styles.active : ''}`}
          onClick={() => onToggleFavorite(game.id)}
          aria-label={game.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          ♥
        </button>
        <div className={styles.gameRating}>{game.rating.toFixed(1)}</div>
      </div>
      
      <div className={styles.gameInfo}>
        <h3>{game.title}</h3>
        
        <div className={styles.gameMeta}>
          {game.platforms.map((platform) => (
            <span 
              key={platform} 
              className={`${styles.platform} ${styles[platform.toLowerCase()]}`}
            >
              {platform}
            </span>
          ))}
        </div>
        
        <div className={styles.gameGenres}>
          {game.genres.map((genre) => (
            <span key={genre} className={styles.genre}>
              {genre}
            </span>
          ))}
        </div>
        
        <p className={styles.gameDescription}>{game.description}</p>
        
        <div className={styles.gameActions}>
          <button
            className={`${styles.btn} ${styles.wishlistBtn} ${game.isInWishlist ? styles.inWishlist : ''}`}
            onClick={() => onAddToWishlist(game.id)}
          >
            {game.isInWishlist ? 'В желаемом' : 'Добавить в желаемое'}
          </button>
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