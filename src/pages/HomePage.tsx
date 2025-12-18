import React, { useState, useMemo } from 'react';
import GameFilters from '../components/games/GameFilters';
import GameCard from '../components/games/GameCard';
import { Game, FilterState } from '../types/game';
import styles from './HomePage.module.css';

// Моковые данные (позже заменим на Supabase)
const initialGames: Game[] = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Научно-фантастическая RPG в открытом мире от создателей Ведьмака.',
    rating: 4.5,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Action'],
    imageUrl: '/images/cyberpunk.png',
    isFavorite: false,
    isInWishlist: false,
    releaseDate: '2020-12-10',
  },
  {
    id: 2,
    title: 'Elden Ring',
    description: 'Фэнтезийная action-RPG от создателей Dark Souls.',
    rating: 4.8,
    platforms: ['PC', 'PS5', 'Xbox'],
    genres: ['RPG', 'Action', 'Fantasy'],
    imageUrl: '/images/elden.webp',
    isFavorite: true,
    isInWishlist: false,
    releaseDate: '2022-02-25',
  },
  // Добавьте остальные игры из вашего HTML
];

const HomePage: React.FC = () => {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    genres: [],
    sortBy: 'popular',
    searchQuery: '',
  });

  // Фильтрация и сортировка игр
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Фильтрация по поиску
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }

    // Фильтрация по платформам
    if (filters.platforms.length > 0) {
      result = result.filter(game =>
        filters.platforms.every(platform => game.platforms.includes(platform))
      );
    }

    // Фильтрация по жанрам
    if (filters.genres.length > 0) {
      result = result.filter(game =>
        filters.genres.every(genre => game.genres.includes(genre))
      );
    }

    // Сортировка
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'release':
        result.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      case 'popular':
      default:
        // Можно добавить логику для популярности
        break;
    }

    return result;
  }, [games, filters]);

  const handleToggleFavorite = (gameId: number) => {
    setGames(games.map(game =>
      game.id === gameId
        ? { ...game, isFavorite: !game.isFavorite }
        : game
    ));
  };

  const handleAddToWishlist = (gameId: number) => {
    setGames(games.map(game =>
      game.id === gameId
        ? { ...game, isInWishlist: !game.isInWishlist }
        : game
    ));
  };

  // Разделение на популярные и новые игры
  const popularGames = filteredGames.slice(0, 6);
  const newGames = filteredGames
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 2);

  return (
    <div className="home-page">
      <GameFilters onFilterChange={setFilters} />
      
      <main className="main-content">
        <div className="container">
          <section className="featured-games">
            <h2>Популярные игры</h2>
            <div className="games-grid">
              {popularGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </section>
          
          <section className="new-games">
            <h2>Новые релизы</h2>
            <div className="games-grid">
              {newGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;