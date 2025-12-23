// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Хуки для конкретных селекторов (опционально, для удобства)
export const useGames = () => {
  const games = useSelector((state: RootState) => state.games.games);
  //const filteredGames = useSelector((state: RootState) => state.games.filteredGames);
  const filters = useSelector((state: RootState) => state.games.filters);
  const isLoading = useSelector((state: RootState) => state.games.loading);

  return { games, filters, isLoading };
};

export const useSelectedGame = () => useSelector((state: RootState) => state.games.currentGame);
