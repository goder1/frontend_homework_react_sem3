// src/types/game.ts
export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo Switch';
export type SortBy = 'popular' | 'rating' | 'newest' | 'release' | 'title';

export interface FilterState {
  platforms: Platform[];
  genres: string[];
  sortBy: SortBy;
  searchQuery: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  image_url: string; // было imageUrl
  rating: number;
  price: number;
  release_date: string;
  achievements?: number;
  genres?: string[];
  platforms?: string[];
}