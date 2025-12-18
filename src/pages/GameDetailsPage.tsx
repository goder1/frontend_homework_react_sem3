import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game } from '../types/game';
import styles from './GameDetailsPage.module.css';

const mockGame: Game = {
  id: 2,
  title: 'Elden Ring',
  description: 'Фэнтезийная action-RPG от создателей Dark Souls. Отправляйтесь в эпическое приключение по землям, между которыми лежат, и станьте Повелителем Колец.',
  rating: 4.8,
  platforms: ['PC', 'PS5', 'Xbox'],
  genres: ['RPG', 'Action', 'Fantasy', 'Souls-like'],
  imageUrl: '/images/elden.webp',
  isFavorite: true,
  isInWishlist: false,
  releaseDate: '2022-02-25',
};

const GameDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState(mockGame);
  const [activeTab, setActiveTab] = useState<'min' | 'rec'>('min');
  const [activeImage, setActiveImage] = useState(0);
  
  const images = [
    game.imageUrl,
    '/images/elden2.jpg',
    '/images/elden3.jpg',
    '/images/elden4.jpg',
  ];

  const handleToggleFavorite = () => {
    setGame(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const handleToggleWishlist = () => {
    setGame(prev => ({ ...prev, isInWishlist: !prev.isInWishlist }));
  };

  const similarGames: Game[] = [
    {
      id: 1,
      title: 'Dark Souls III',
      description: '',
      rating: 4.7,
      platforms: ['PC', 'PS5', 'Xbox'],
      genres: ['RPG', 'Action'],
      imageUrl: '/images/darksouls.jpg',
      isFavorite: false,
      isInWishlist: false,
      releaseDate: '2016-03-24',
    },
    {
      id: 3,
      title: 'Bloodborne',
      description: '',
      rating: 4.9,
      platforms: ['PS5'],
      genres: ['RPG', 'Action'],
      imageUrl: '/images/bloodborne.jpg',
      isFavorite: false,
      isInWishlist: false,
      releaseDate: '2015-03-24',
    },
  ];

  const achievements = [
    { id: 1, name: 'Повелитель Колец', desc: 'Соберите все Великие Руны', progress: '15%' },
    { id: 2, name: 'Мастер клинка', desc: 'Победите 100 врагов мечом', progress: '87%' },
    { id: 3, name: 'Исследователь', desc: 'Откройте все области карты', progress: '42%' },
  ];

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

        <div className={styles.gameHero}>
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

          <div className={styles.gameSidebar}>
            <div className={styles.gameHeader}>
              <h1>{game.title}</h1>
              <div className={styles.gameActionsTop}>
                <button
                  className={`${styles.favoriteBtn} ${styles.large} ${game.isFavorite ? styles.active : ''}`}
                  onClick={handleToggleFavorite}
                  aria-label={game.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  ♥
                </button>
                <button
                  className={`${styles.wishlistBtn} ${styles.large} ${game.isInWishlist ? styles.active : ''}`}
                  onClick={handleToggleWishlist}
                  aria-label={game.isInWishlist ? 'Удалить из желаемого' : 'Добавить в желаемое'}
                >
                  ⭐
                </button>
              </div>
            </div>

            <div className={styles.gameRatingLarge}>
              <div className={styles.ratingScore}>{game.rating.toFixed(1)}</div>
              <div className={styles.ratingStars}>★★★★★</div>
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
                  {game.platforms.map(p => (
                    <span key={p} className={`${styles.platform} ${styles[p.toLowerCase()]}`}>
                      {p}
                    </span>
                  ))}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span>Жанры</span>
                <span>{game.genres.join(', ')}</span>
              </div>
              <div className={styles.metaItem}>
                <span>Дата выхода</span>
                <span>{new Date(game.releaseDate).toLocaleDateString('ru-RU')}</span>
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
              <div className={styles.priceOld}>3 499 ₽</div>
              <div className={styles.discount}>-14%</div>
              <button className={styles.btnBuy}>Купить сейчас</button>
            </div>
          </div>
        </div>

        <div className={styles.gameContent}>
          <div className={styles.contentMain}>
            <section className={styles.descriptionSection}>
              <h2>Описание</h2>
              <p>{game.description}</p>
              <p>Взойдите на трон и станьте Повелителем Колец в мире, где мифы и легенды оживают. Исследуйте обширные земли, сражайтесь с могущественными противниками и открывайте тайны этого загадочного мира.</p>
            </section>

            <section className={styles.featuresSection}>
              <h2>Ключевые особенности</h2>
              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🌍</div>
                  <h4>Открытый мир</h4>
                  <p>Обширные земли для исследования без ограничений</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>⚔️</div>
                  <h4>Глубокий бой</h4>
                  <p>Динамичная система сражений с сотнями оружия</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🏰</div>
                  <h4>Эпические битвы</h4>
                  <p>Сражайтесь с гигантскими боссами и могущественными врагами</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🎭</div>
                  <h4>Кастомизация</h4>
                  <p>Создайте уникального персонажа со своей историей</p>
                </div>
              </div>
            </section>

            <section className={styles.requirementsSection}>
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
            </section>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarWidget}>
              <h3>Похожие игры</h3>
              {similarGames.map(similarGame => (
                <div key={similarGame.id} className={styles.similarGame}>
                  <img src={similarGame.imageUrl} alt={similarGame.title} />
                  <div className={styles.similarInfo}>
                    <h4>{similarGame.title}</h4>
                    <div className={styles.similarRating}>⭐ {similarGame.rating}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.sidebarWidget}>
              <h3>Достижения</h3>
              {achievements.map(achievement => (
                <div key={achievement.id} className={styles.achievement}>
                  <div className={styles.achievementIcon}>🏆</div>
                  <div>
                    <div className={styles.achievementName}>{achievement.name}</div>
                    <div className={styles.achievementDesc}>{achievement.desc}</div>
                    <div className={styles.achievementProgress}>{achievement.progress}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsPage;