// src/pages/GameDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchGameById, 
  selectCurrentGame, 
  selectGamesLoading
} from '../store/slices/gamesSlice';
import { 
  toggleFavorite, 
  toggleFavoriteSync,
  selectIsFavorite 
} from '../store/slices/favoritesSlice';
import styles from './GameDetailsPage.module.css';

const GameDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const game = useAppSelector(selectCurrentGame);
  const isLoading = useAppSelector(selectGamesLoading);
  const isFavorite = useAppSelector(selectIsFavorite(id || ''));
  
  const [activeTab, setActiveTab] = useState<'min' | 'rec'>('min');
  const [activeImage, setActiveImage] = useState(0);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchGameById(id));
    }
  }, [id, dispatch]);

  const handleToggleFavorite = () => {
    if (game) {
      // Используем thunk для асинхронного переключения
      dispatch(toggleFavorite({ game, isFavorite: !!isFavorite }));
      
      // И синхронное обновление для мгновенной обратной связи
      dispatch(toggleFavoriteSync({ 
        game, 
        isFavorite: !!isFavorite 
      }));
    }
  };

  const images = [
    '../../public/images/elden.webp',
    game?.image_url || '',
    '../../public/images/elden.webp',
    '../../public/images/elden.webp',
    '../../public/images/elden.webp',
  ];

  if (isLoading) {
    return (
      <div className={styles.gameDetailsPage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка информации об игре...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className={styles.gameDetailsPage}>
        <div className="container">
          <div className={styles.notFound}>
            <h2>Игра не найдена</h2>
            <p>Извините, запрашиваемая игра не существует или была удалена.</p>
            <Link to="/" className={styles.backButton}>
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameDetailsPage}>
      <div className="container">
        <div className={styles.breadcrumbs}>
          <Link to="/">Главная</Link>
          <span className={styles.separator}>/</span>
          <Link to="/">Каталог</Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{game.title}</span>
        </div>

        <div className={styles.gameLayout}>
          {/* Левая колонка - галерея, описание, требования */}
          <div className={styles.gameMainContent}>
            <div className={styles.gameGallery}>
              <div className={styles.mainImage}>
                <img src={images[activeImage]} alt={game.title} />
              </div>
              <div className={styles.imageThumbnails}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`${styles.thumb} ${activeImage === index ? styles.active : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${game.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.contentSection} ${styles.descriptionSection}`}>
              <h2>Описание</h2>
              <p>{game.description}</p>
              <p>Взойдите на трон и станьте Повелителем Колец в мире, где мифы и легенды оживают. Исследуйте обширные земли, сражайтесь с могущественными противниками и открывайте тайны этого загадочного мира.</p>
            </div>

            <div className={`${styles.contentSection} ${styles.requirementsSection}`}>
              <h2>Системные требования</h2>
              <div className={styles.requirementsTabs}>
                <button
                  className={`${styles.reqTab} ${activeTab === 'min' ? styles.active : ''}`}
                  onClick={() => setActiveTab('min')}
                >
                  Минимальные
                </button>
                <button
                  className={`${styles.reqTab} ${activeTab === 'rec' ? styles.active : ''}`}
                  onClick={() => setActiveTab('rec')}
                >
                  Рекомендуемые
                </button>
              </div>
              
              <div className={`${styles.reqSpecs} ${activeTab === 'min' ? styles.active : ''}`}>
                <div className={styles.specItem}>
                  <strong>ОС:</strong> Windows 10
                </div>
                <div className={styles.specItem}>
                  <strong>Процессор:</strong> Intel Core i5-8400
                </div>
                <div className={styles.specItem}>
                  <strong>Память:</strong> 12 GB ОЗУ
                </div>
                <div className={styles.specItem}>
                  <strong>Видеокарта:</strong> NVIDIA GeForce GTX 1060
                </div>
                <div className={styles.specItem}>
                  <strong>Место на диске:</strong> 60 GB
                </div>
              </div>
              
              <div className={`${styles.reqSpecs} ${activeTab === 'rec' ? styles.active : ''}`}>
                <div className={styles.specItem}>
                  <strong>ОС:</strong> Windows 10/11
                </div>
                <div className={styles.specItem}>
                  <strong>Процессор:</strong> Intel Core i7-8700K
                </div>
                <div className={styles.specItem}>
                  <strong>Память:</strong> 16 GB ОЗУ
                </div>
                <div className={styles.specItem}>
                  <strong>Видеокарта:</strong> NVIDIA GeForce RTX 2070
                </div>
                <div className={styles.specItem}>
                  <strong>Место на диске:</strong> 60 GB
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - информация об игре и цена */}
          <div className={styles.gameSidebar}>
            <div className={styles.gameHeader}>
              <h1>{game.title}</h1>
              <div className={styles.gameActionsTop}>
                <button
                  className={`${styles.favoriteBtn} ${styles.large} ${isFavorite ? styles.active : ''}`}
                  onClick={handleToggleFavorite}
                  aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  {isFavorite ? '♥' : '♡'}
                </button>
              </div>
            </div>

            <div className={styles.gameRatingLarge}>
              <div className={styles.ratingScore}>{game.rating.toFixed(1)}</div>
              <div className={styles.ratingStars}>
                {'★'.repeat(Math.floor(game.rating))}
                {'☆'.repeat(5 - Math.floor(game.rating))}
              </div>
              <div className={styles.ratingCount}>4,832 оценки</div>
            </div>

            <div className={styles.compatibilityBadge}>
              <div className={styles.compatIcon}>🎯</div>
              <div>
                <div className={styles.compatPercent}>94%</div>
                <div className={styles.compatText}>Совместимость с вашим стилем</div>
              </div>
            </div>

            <div className={styles.gameMetaDetail}>
              <div className={styles.metaItem}>
                <span>Платформы</span>
                <span>
                  {game.platforms?.map((p: string) => (
                    <span key={p} className={`${styles.platform} ${styles[p.toLowerCase()]}`}>
                      {p}
                    </span>
                  )) || 'Не указаны'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span>Жанры</span>
                <span>{game.genres?.join(', ') || 'Не указаны'}</span>
              </div>
              <div className={styles.metaItem}>
                <span>Дата выхода</span>
                <span>{game.release_date ? new Date(game.release_date).toLocaleDateString('ru-RU') : 'Не указана'}</span>
              </div>
              <div className={styles.metaItem}>
                <span>Разработчик</span>
                <span>FromSoftware</span>
              </div>
              <div className={styles.metaItem}>
                <span>Издатель</span>
                <span>Bandai Namco</span>
              </div>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.price}>2 999 ₽</div>
              <button className={styles.btnBuy}>Купить сейчас</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;