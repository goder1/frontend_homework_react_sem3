// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gamesReducer from './slices/gamesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  games: gamesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;