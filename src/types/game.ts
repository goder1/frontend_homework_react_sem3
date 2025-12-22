export interface Game {
  id: number;
  title: string;
  description: string;
  rating: number;
  platforms: Platform[];
  genres: string[];
  imageUrl: string;
  isFavorite: boolean;
  releaseDate: string;
}

export type Platform = 'PC' | 'PS5' | 'Xbox';

export interface FilterState {
  platforms: Platform[];
  genres: string[];
  sortBy: 'popular' | 'newest' | 'rating' | 'release';
  searchQuery: string;
}