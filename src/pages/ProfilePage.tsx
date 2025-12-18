import React, { useState } from 'react';
import { Game } from '../types/game';
import styles from './ProfilePage.module.css';

const mockProfile = {
  username: 'CyberPlayer',
  tag: '@gamer_pro',
  avatarUrl: '/images/avatar.png',
  level: 42,
  gamesPlayed: 127,
  totalHours: 856,
  completionRate: 68,
  favoriteGenre: 'RPG',
  joinDate: '2022-01-15',
};

const mockRecentGames: Game[] = [
  {
    id: 2,
    title: 'Elden Ring',
    description: 'Фэнтезийная action-RPG от создателей Dark Souls.',
    rating: 4.8,
    platforms: ['PC'],
    genres: ['RPG', 'Action'],
    imageUrl: '/images/elden.webp',
    isFavorite: true,
    isInWishlist: false,
    releaseDate: '2022-02-25',
  },
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Научно-фантастическая RPG в открытом мире от создателей Ведьмака.',
    rating: 4.5,
    platforms: ['PC'],
    genres: ['RPG', 'Action'],
    imageUrl: '/images/cyberpunk.png',
    isFavorite: true,
    isInWishlist: false,
    releaseDate: '2020-12-10',
  },
  {
    id: 6,
    title: 'Total War: Warhammer III',
    description: 'Грандиозная стратегия в мире Warhammer Fantasy.',
    rating: 4.6,
    platforms: ['PC'],
    genres: ['Strategy'],
    imageUrl: '/images/total_war.jpg',
    isFavorite: false,
    isInWishlist: true,
    releaseDate: '2022-02-17',
  },
];

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>Профиль игрока</h1>
          <p>Управляйте своей учетной записью и отслеживайте прогресс</p>
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <img src={profile.avatarUrl} alt={profile.username} />
                <div className={`${styles.avatarStatus} ${styles.online}`} />
              </div>
              
              <div className={styles.profileInfo}>
                {isEditing ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Имя пользователя"
                    />
                    <input
                      type="text"
                      name="tag"
                      value={editForm.tag}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="@тег"
                    />
                  </div>
                ) : (
                  <>
                    <h2>{profile.username}</h2>
                    <p className={styles.profileTag}>{profile.tag}</p>
                  </>
                )}
                
                <div className={styles.profileStats}>
                  <div className={styles.profileStat}>
                    <span className={styles.statValue}>{profile.level}</span>
                    <span className={styles.statLabel}>Уровень</span>
                  </div>
                  <div className={styles.profileStat}>
                    <span className={styles.statValue}>{profile.gamesPlayed}</span>
                    <span className={styles.statLabel}>Игр сыграно</span>
                  </div>
                  <div className={styles.profileStat}>
                    <span className={styles.statValue}>{profile.totalHours}</span>
                    <span className={styles.statLabel}>Часов в играх</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.profileActions}>
                {isEditing ? (
                  <div className={styles.editActions}>
                    <button className={styles.btnSave} onClick={handleSave}>
                      Сохранить
                    </button>
                    <button className={styles.btnCancel} onClick={handleCancel}>
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button className={styles.btnEdit} onClick={handleEdit}>
                    Редактировать профиль
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🎯</div>
              <div>
                <div className={styles.statNumber}>{profile.completionRate}%</div>
                <div className={styles.statLabel}>Прохождение игр</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🏆</div>
              <div>
                <div className={styles.statNumber}>243</div>
                <div className={styles.statLabel}>Достижения</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>⭐</div>
              <div>
                <div className={styles.statNumber}>4.7</div>
                <div className={styles.statLabel}>Средняя оценка</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🎮</div>
              <div>
                <div className={styles.statNumber}>{profile.favoriteGenre}</div>
                <div className={styles.statLabel}>Любимый жанр</div>
              </div>
            </div>
          </div>

          <div className={styles.recentGames}>
            <h3>Недавно играли</h3>
            <div className={styles.gamesList}>
              {mockRecentGames.map((game) => (
                <div key={game.id} className={styles.recentGame}>
                  <img src={game.imageUrl} alt={game.title} />
                  <div className={styles.gameDetails}>
                    <h4>{game.title}</h4>
                    <div className={styles.gameMeta}>
                      <span className={styles.rating}>⭐ {game.rating}</span>
                      <span className={styles.playtime}>🕐 45 ч</span>
                      <span className={styles.completion}>✅ 72%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dnaAnalyzer}>
            <h3>DNA-анализатор игрока</h3>
            <div className={styles.dnaContainer}>
              <div className={styles.dnaVisualization}>
                <div className={styles.playerAvatar}>
                  <img src={profile.avatarUrl} alt="Аватар игрока" />
                  <div className={styles.avatarOverlay}>
                    <div className={styles.playerLevel}>{profile.level}</div>
                    <div className={styles.playerBadge}>Cyber Gamer</div>
                  </div>
                </div>
                
                <div className={styles.playerInfo}>
                  <h3>{profile.username}</h3>
                  <p className={styles.playerTag}>{profile.tag}</p>
                  
                  <div className={styles.playerStats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{profile.gamesPlayed}</div>
                      <div className={styles.statLabel}>Игр</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{profile.totalHours}</div>
                      <div className={styles.statLabel}>Часов</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{profile.completionRate}%</div>
                      <div className={styles.statLabel}>Прохождение</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.dnaStats}>
                <div className={styles.dnaMetric}>
                  <h4>Исследователь</h4>
                  <div className={styles.dnaProgress}>
                    <div 
                      className={`${styles.progressFill} ${styles.explorer}`}
                      style={{ width: '85%' }}
                    />
                    <span>85%</span>
                  </div>
                </div>
                
                <div className={styles.dnaMetric}>
                  <h4>Комплетионист</h4>
                  <div className={styles.dnaProgress}>
                    <div 
                      className={`${styles.progressFill} ${styles.completionist}`}
                      style={{ width: '68%' }}
                    />
                    <span>68%</span>
                  </div>
                </div>
                
                <div className={styles.dnaMetric}>
                  <h4>Хардкорный геймер</h4>
                  <div className={styles.dnaProgress}>
                    <div 
                      className={`${styles.progressFill} ${styles.hardcore}`}
                      style={{ width: '92%' }}
                    />
                    <span>92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;