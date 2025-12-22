// src/types/profile.ts
export interface UserGame {
  id: number;
  gameId: number; // Ссылка на основную таблицу игр
  userId: string; // Ссылка на пользователя
  
  // Данные пользователя об игре
  userRating: number; // 1-5
  hoursPlayed: number;
  achievementsCompleted: number;
  totalAchievements: number;
  completionPercentage: number;
  
  // Статус игры
  status: 'playing' | 'completed' | 'on-hold' | 'dropped' | 'planning';
  
  // Дополнительная информация
  lastPlayed: string; // ISO дата
  notes?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  platform?: string; // На какой платформе играет пользователь
  
  // Метаданные
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  totalGames: number;
  totalHours: number;
  averageRating: number;
  completionRate: number;
  favoriteGenre: string;
  favoritePlatform: string;
  achievementsTotal: number;
  achievementsCompleted: number;
  gamesByStatus: {
    playing: number;
    completed: number;
    'on-hold': number;
    dropped: number;
    planning: number;
  };
}

export interface ProfileState {
  userGames: UserGame[];
  stats: ProfileStats;
  isLoading: boolean;
  error: string | null;
}

export interface AddGameData {
  gameId: number;
  userRating?: number;
  hoursPlayed?: number;
  achievementsCompleted?: number;
  status?: UserGame['status'];
  notes?: string;
}

export interface UpdateGameData {
  userRating?: number;
  hoursPlayed?: number;
  achievementsCompleted?: number;
  status?: UserGame['status'];
  notes?: string;
  lastPlayed?: string;
}