import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // добавьте другие редьюсеры здесь
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;