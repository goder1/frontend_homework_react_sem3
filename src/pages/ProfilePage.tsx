// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  logoutUser, 
  selectCurrentUser 
} from '../store/slices/authSlice';
import { selectAllGames, fetchAllGames } from '../store/slices/gamesSlice'; // Добавили fetchAllGames
import {
  // Селекторы
  selectUserGames,
  selectProfileStats,
  selectProfileLoading,
  selectPaginatedUserGames,
  selectTotalUserGames,
  // Actions
  fetchUserGames,
  addUserGame,
  updateUserGame,
  removeUserGame,
  clearError,
  resetProfile,
  // Типы
  AddGameData,
  UpdateGameData
} from '../store/slices/profileSlice';
import { UserGame } from '../types/profile';
import { Game } from '../types/game';
import styles from './ProfilePage.module.css';

// Моковый профиль для заглушки (будет заменен данными из authSlice)
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

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Получаем данные из Redux
  const user = useAppSelector(selectCurrentUser);
  const allGames = useAppSelector(selectAllGames);
  const userGames = useAppSelector(selectUserGames);
  const profileStats = useAppSelector(selectProfileStats);
  const isLoading = useAppSelector(selectProfileLoading);
  
  // Refs для управления выпадающим списком
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Локальные состояния
  const [profile, setProfile] = useState(() => {
    if (user) {
      return { ...mockProfile, ...user };
    }
    return mockProfile;
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState(profile);
  const [showAddGameForm, setShowAddGameForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [achievementsCompleted, setAchievementsCompleted] = useState('');
  const [gameStatus, setGameStatus] = useState<UserGame['status']>('playing');
  const [notes, setNotes] = useState('');
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const gamesPerPage = 5;
  
  // Селектор для пагинированных игр
  const currentGames = useAppSelector(selectPaginatedUserGames(currentPage, gamesPerPage));
  const totalUserGames = useAppSelector(selectTotalUserGames);
  const totalPages = Math.ceil(totalUserGames / gamesPerPage);

  // Создаем мемоизированный объект для быстрого поиска игр
  const gamesMap = useMemo(() => {
    const map = new Map<string, Game>();
    allGames.forEach(game => map.set(game.id, game));
    return map;
  }, [allGames]);

  // Обновляем profile при изменении user из Redux
  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, ...user }));
      setEditProfileForm(prev => ({ ...prev, ...user }));
      
      // Загружаем игры пользователя
      dispatch(fetchUserGames(user.id));
      
      // Загружаем ВСЕ игры для поиска
      dispatch(fetchAllGames());
    }
  }, [user, dispatch]);

  // Обработчик кликов вне области поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Фильтрация игр для поиска (исключаем уже добавленные)
  const filteredGames = useMemo(() => {
    if (!searchQuery || editingGameId) return [];
    
    return allGames.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (game.genres && game.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())));
      const notInCollection = !userGames.some(userGame => userGame.gameId === game.id);
      return matchesSearch && notInCollection;
    });
  }, [allGames, searchQuery, userGames, editingGameId]);

  // Управление показом результатов поиска
  useEffect(() => {
    if (searchQuery && filteredGames.length > 0 && isSearchFocused && !editingGameId) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, filteredGames, isSearchFocused, editingGameId]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditProfileForm(profile);
  };

  const handleSaveProfile = () => {
    setProfile(editProfileForm);
    setIsEditingProfile(false);
    
    // TODO: Добавить обновление профиля через API
    console.log('Обновление профиля:', editProfileForm);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setEditProfileForm(profile);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(resetProfile());
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleGameSelect = (game: Game) => {
    console.log('Выбрана игра:', game.title, game.id);
    setSelectedGame(game);
    setSearchQuery(game.title);
    setShowSearchResults(false);
    setIsSearchFocused(false);
    
    // Фокус на следующий элемент формы
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }, 10);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Если начали новый поиск, сбрасываем выбранную игру
    if (selectedGame && selectedGame.title !== value) {
      setSelectedGame(null);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery && filteredGames.length > 0 && !editingGameId) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Не скрываем результаты сразу, чтобы дать время на клик по элементу
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame || !user) {
      alert('Пожалуйста, выберите игру');
      return;
    }

    // Проверка на дубликаты
    const isDuplicate = userGames.some(game => game.gameId === selectedGame.id);
    if (isDuplicate) {
      alert('Эта игра уже есть в вашей коллекции!');
      return;
    }

    const gameData: AddGameData = {
      gameId: selectedGame.id,
      userRating,
      hoursPlayed: parseInt(hoursPlayed) || 0,
      achievementsCompleted: parseInt(achievementsCompleted) || 0,
      status: gameStatus,
      notes: notes || undefined,
    };

    try {
      await dispatch(addUserGame({ userId: user.id, gameData })).unwrap();
      
      // Сброс формы
      resetGameForm();
      setShowAddGameForm(false);
    } catch (error) {
      console.error('Ошибка при добавлении игры:', error);
      alert('Ошибка при добавлении игры. Проверьте консоль для деталей.');
    }
  };

  const handleEditGame = (userGameId: string) => {
    const gameToEdit = userGames.find(g => g.id === userGameId);
    if (!gameToEdit) return;

    const gameData = gamesMap.get(gameToEdit.gameId);
    if (!gameData) return;

    setEditingGameId(userGameId);
    setSelectedGame(gameData);
    setUserRating(gameToEdit.userRating);
    setHoursPlayed(gameToEdit.hoursPlayed.toString());
    setAchievementsCompleted(gameToEdit.achievementsCompleted.toString());
    setGameStatus(gameToEdit.status);
    setNotes(gameToEdit.notes || '');
    setShowAddGameForm(true);
    setSearchQuery(gameData.title);
    setShowSearchResults(false);
    setIsSearchFocused(false);
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGame || !editingGameId) {
      alert('Ошибка редактирования');
      return;
    }

    const updateData: UpdateGameData = {
      userRating,
      hoursPlayed: parseInt(hoursPlayed) || 0,
      achievementsCompleted: parseInt(achievementsCompleted) || 0,
      status: gameStatus,
      notes: notes || undefined,
    };

    try {
      await dispatch(updateUserGame({ 
        gameId: editingGameId, 
        updateData 
      })).unwrap();
      
      // Сброс формы
      resetGameForm();
      setEditingGameId(null);
      setShowAddGameForm(false);
    } catch (error) {
      console.error('Ошибка при обновлении игры:', error);
    }
  };

  const handleRemoveGame = async (userGameId: string) => {
    const gameToRemove = userGames.find(g => g.id === userGameId);
    if (!gameToRemove) return;

    if (window.confirm('Удалить эту игру из коллекции?')) {
      try {
        await dispatch(removeUserGame(userGameId)).unwrap();
      } catch (error) {
        console.error('Ошибка при удалении игры:', error);
      }
    }
  };

  const resetGameForm = () => {
    setSelectedGame(null);
    setSearchQuery('');
    setUserRating(0);
    setHoursPlayed('');
    setAchievementsCompleted('');
    setGameStatus('playing');
    setNotes('');
    setEditingGameId(null);
    setShowSearchResults(false);
    setIsSearchFocused(false);
  };

  const getStatusColor = (status: UserGame['status']) => {
    switch (status) {
      case 'completed': return '#2ecc71';
      case 'playing': return '#3498db';
      case 'on-hold': return '#f39c12';
      case 'dropped': return '#e74c3c';
      case 'planning': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: UserGame['status']) => {
    switch (status) {
      case 'completed': return 'Завершена';
      case 'playing': return 'В процессе';
      case 'on-hold': return 'На паузе';
      case 'dropped': return 'Брошена';
      case 'planning': return 'В планах';
      default: return 'Неизвестно';
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.active : ''}`}
            onClick={() => interactive && onStarClick?.(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Назад
        </button>
        
        <div className={styles.pageNumbers}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          className={styles.pageButton}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Вперед →
        </button>
      </div>
    );
  };

  if (isLoading && userGames.length === 0) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

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
                {isEditingProfile ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      name="username"
                      value={editProfileForm.username}
                      onChange={handleProfileChange}
                      className={styles.formInput}
                      placeholder="Имя пользователя"
                    />
                    <input
                      type="text"
                      name="tag"
                      value={editProfileForm.tag}
                      onChange={handleProfileChange}
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
                    <span className={styles.statValue}>{profileStats.totalGames}</span>
                    <span className={styles.statLabel}>Игр в коллекции</span>
                  </div>
                  <div className={styles.profileStat}>
                    <span className={styles.statValue}>{profileStats.totalHours}</span>
                    <span className={styles.statLabel}>Часов в играх</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.profileActions}>
                {isEditingProfile ? (
                  <div className={styles.editActions}>
                    <button className={styles.btnSave} onClick={handleSaveProfile}>
                      Сохранить
                    </button>
                    <button className={styles.btnCancel} onClick={handleCancelProfile}>
                      Отмена
                    </button>
                  </div>
                ) : (
                  <>
                    <button className={styles.btnEdit} onClick={handleEditProfile}>
                      Редактировать профиль
                    </button>
                    <button 
                      className={styles.btnLogout} 
                      onClick={handleLogout}
                      title="Выйти из аккаунта"
                    >
                      Выйти
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🎯</div>
              <div>
                <div className={styles.statNumber}>{profileStats.completionRate.toFixed(0)}%</div>
                <div className={styles.statLabel}>Прохождение игр</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🏆</div>
              <div>
                <div className={styles.statNumber}>
                  {profileStats.achievementsCompleted}
                </div>
                <div className={styles.statLabel}>Достижения</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>⭐</div>
              <div>
                <div className={styles.statNumber}>
                  {profileStats.averageRating.toFixed(1)}
                </div>
                <div className={styles.statLabel}>Средняя оценка</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🎮</div>
              <div>
                <div className={styles.statNumber}>{profileStats.favoriteGenre}</div>
                <div className={styles.statLabel}>Любимый жанр</div>
              </div>
            </div>
          </div>

          {/* Секция управления играми */}
          <div className={styles.addGameSection}>
            <div className={styles.sectionHeader}>
              <h3>Моя игровая коллекция ({profileStats.totalGames} игр)</h3>
              <button 
                className={styles.btnAddGame}
                onClick={() => {
                  resetGameForm();
                  setShowAddGameForm(!showAddGameForm);
                }}
              >
                {showAddGameForm ? 'Отмена' : 'Добавить игру'}
              </button>
            </div>

            {showAddGameForm && (
              <form className={styles.addGameForm} onSubmit={editingGameId ? handleUpdateGame : handleAddGame}>
                <div className={styles.formHeader}>
                  <h4>{editingGameId ? 'Редактировать игру' : 'Добавить новую игру'}</h4>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup} ref={searchRef}>
                    <label htmlFor="gameSearch">Поиск игры *</label>
                    <div className={styles.searchContainer}>
                      <input
                        ref={searchInputRef}
                        id="gameSearch"
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        placeholder="Введите название игры..."
                        className={styles.searchInput}
                        autoComplete="off"
                        disabled={!!editingGameId}
                        required
                      />
                      
                      {showSearchResults && filteredGames.length > 0 && (
                        <div className={styles.searchResults}>
                          {filteredGames.slice(0, 5).map((game) => (
                            <div
                              key={game.id}
                              className={`${styles.searchResultItem} ${selectedGame?.id === game.id ? styles.selected : ''}`}
                              onMouseDown={(e) => {
                                e.preventDefault(); // Предотвращаем blur на input
                                handleGameSelect(game);
                              }}
                            >
                              <img src={game.image_url} alt={game.title} className={styles.searchResultImage} />
                              <div className={styles.searchResultInfo}>
                                <h4>{game.title}</h4>
                                <p>{game.genres?.join(', ') || 'Жанры не указаны'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {searchQuery && !showSearchResults && filteredGames.length === 0 && !editingGameId && (
                        <div className={styles.searchResults}>
                          <div className={styles.noResults}>
                            Игра не найдена. Попробуйте другой запрос.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedGame && (
                  <>
                    <div className={styles.selectedGamePreview}>
                      <img src={selectedGame.image_url} alt={selectedGame.title} />
                      <div>
                        <h4>{selectedGame.title}</h4>
                        <p>{selectedGame.genres?.join(', ') || 'Жанры не указаны'}</p>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Ваша оценка</label>
                        <div className={styles.ratingInput}>
                          {renderStars(userRating, true, setUserRating)}
                          <span className={styles.ratingValue}>{userRating}/5</span>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="hoursPlayed">Часов наиграно *</label>
                        <input
                          id="hoursPlayed"
                          type="number"
                          value={hoursPlayed}
                          onChange={(e) => setHoursPlayed(e.target.value)}
                          min="0"
                          max="9999"
                          className={styles.numberInput}
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="achievements">Достижения</label>
                        <div className={styles.achievementsInput}>
                          <input
                            id="achievements"
                            type="number"
                            value={achievementsCompleted}
                            onChange={(e) => setAchievementsCompleted(e.target.value)}
                            min="0"
                            max={selectedGame.achievements || 999}
                            className={styles.numberInput}
                            placeholder="0"
                          />
                          <span className={styles.achievementsTotal}>
                            / {selectedGame.achievements || '?'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="status">Статус *</label>
                        <select
                          id="status"
                          value={gameStatus}
                          onChange={(e) => setGameStatus(e.target.value as UserGame['status'])}
                          className={styles.statusSelect}
                          required
                        >
                          <option value="playing">В процессе</option>
                          <option value="completed">Завершена</option>
                          <option value="on-hold">На паузе</option>
                          <option value="dropped">Брошена</option>
                          <option value="planning">В планах</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="lastPlayed">Последняя игра</label>
                      <input
                        id="lastPlayed"
                        type="date"
                        value={new Date().toISOString().split('T')[0]}
                        className={styles.dateInput}
                        disabled
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="notes">Заметки (опционально)</label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={styles.notesInput}
                        placeholder="Ваши впечатления, комментарии, планы..."
                        rows={3}
                      />
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnSubmit}>
                        {editingGameId ? 'Сохранить изменения' : 'Добавить в коллекцию'}
                      </button>
                      <button 
                        type="button" 
                        className={styles.btnCancelForm}
                        onClick={() => {
                          resetGameForm();
                          setShowAddGameForm(false);
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  </>
                )}

                {!selectedGame && searchQuery && (
                  <div className={styles.selectionHint}>
                    <p>Выберите игру из списка выше, чтобы продолжить</p>
                  </div>
                )}
              </form>
            )}

            {/* Список игр с пагинацией */}
            {userGames.length > 0 ? (
              <>
                <div className={styles.userGamesList}>
                  {currentGames.map((userGame) => {
                    const game = gamesMap.get(userGame.gameId);
                    if (!game) return null;

                    return (
                      <div key={userGame.id} className={styles.userGameCard}>
                        <div className={styles.userGameHeader}>
                          <img src={game.image_url} alt={game.title} className={styles.userGameImage} />
                          <div className={styles.userGameInfo}>
                            <h4>{game.title}</h4>
                            <div className={styles.userGameMeta}>
                              <span className={styles.userGameStatus} style={{ backgroundColor: getStatusColor(userGame.status) }}>
                                {getStatusText(userGame.status)}
                              </span>
                              <span className={styles.userGameHours}>🕐 {userGame.hoursPlayed} ч</span>
                              <span className={styles.userGameAchievements}>🏆 {userGame.achievementsCompleted}/{userGame.totalAchievements}</span>
                            </div>
                          </div>
                          <div className={styles.userGameActions}>
                            <button
                              className={styles.btnEditGame}
                              onClick={() => handleEditGame(userGame.id)}
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button
                              className={styles.btnRemoveGame}
                              onClick={() => handleRemoveGame(userGame.id)}
                              title="Удалить игру из коллекции"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.userGameDetails}>
                          <div className={styles.userGameRating}>
                            <span>Ваша оценка:</span>
                            {renderStars(userGame.userRating)}
                          </div>
                          
                          <div className={styles.userGameProgress}>
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progressFill}
                                style={{ width: `${userGame.completionPercentage}%` }}
                              />
                            </div>
                            <span className={styles.progressText}>{userGame.completionPercentage}% завершено</span>
                          </div>
                          
                          {userGame.notes && (
                            <div className={styles.userGameNotes}>
                              <p>{userGame.notes}</p>
                            </div>
                          )}
                          
                          <div className={styles.userGameFooter}>
                            <span className={styles.lastPlayed}>
                              Последняя игра: {new Date(userGame.lastPlayed).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Пагинация */}
                {renderPagination()}

                <div className={styles.paginationInfo}>
                  Показано {Math.min((currentPage - 1) * gamesPerPage + 1, totalUserGames)}-
                  {Math.min(currentPage * gamesPerPage, totalUserGames)} из {totalUserGames} игр
                </div>
              </>
            ) : (
              <div className={styles.emptyGamesList}>
                <p>У вас пока нет добавленных игр. Начните добавлять их выше!</p>
              </div>
            )}
          </div>

          {/* DNA-анализатор */}
          <div className={styles.dnaAnalyzer}>
            <h3>DNA-анализатор игрока</h3>
            <div className={styles.dnaContainer}>
              <div className={styles.dnaVisualization}>
                <div className={styles.playerAvatar}>
                  <img src={profile.avatarUrl} alt="Аватар игрока" />
                </div>
                
                <div className={styles.playerInfo}>
                  <h3>{profile.username}</h3>
                  <p className={styles.playerTag}>{profile.tag}</p>
                  
                  <div className={styles.playerStats}>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{profileStats.totalGames}</div>
                      <div className={styles.statLabel}>В коллекции</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>{profileStats.totalHours}</div>
                      <div className={styles.statLabel}>Часов</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statValue}>
                        {profileStats.gamesByStatus.completed}
                      </div>
                      <div className={styles.statLabel}>Завершено</div>
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
                      style={{ width: `${Math.min(100, profileStats.totalGames * 15)}%` }}
                    />
                    <span>{Math.min(100, profileStats.totalGames * 15)}%</span>
                  </div>
                </div>
                
                <div className={styles.dnaMetric}>
                  <h4>Комплетионист</h4>
                  <div className={styles.dnaProgress}>
                    <div 
                      className={`${styles.progressFill} ${styles.completionist}`}
                      style={{ 
                        width: `${profileStats.completionRate}%` 
                      }}
                    />
                    <span>{profileStats.completionRate.toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className={styles.dnaMetric}>
                  <h4>Хардкорный геймер</h4>
                  <div className={styles.dnaProgress}>
                    <div 
                      className={`${styles.progressFill} ${styles.hardcore}`}
                      style={{ width: `${Math.min(100, profileStats.totalHours / 15)}%` }}
                    />
                    <span>{Math.min(100, Math.round(profileStats.totalHours / 15))}%</span>
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