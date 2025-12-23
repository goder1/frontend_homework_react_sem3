// src/App.tsx
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import GameDetailsPage from './pages/GameDetailsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

// Компонент для инициализации приложения (вынесен для удобства)
const AppInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Проверяем авторизацию при запуске приложения
    console.log('App: Checking auth on startup...');
    dispatch(checkAuth())
      .unwrap()
      .then((user) => {
        if (user) {
          console.log('App: User authenticated:', user.email);
        } else {
          console.log('App: No authenticated user');
        }
      })
      .catch((error) => {
        console.error('App: Error checking auth:', error);
      });
  }, [dispatch]);
  
  return null; // Этот компонент ничего не рендерит
};

// Главный компонент приложения
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Страница авторизации - доступна только для неавторизованных */}
        <Route path="/auth" element={
          <ProtectedRoute requireAuth={false} redirectTo="/">
            <AuthPage />
          </ProtectedRoute>
        } />
        
        {/* Основной layout для всех страниц */}
        <Route element={<Layout />}>
          {/* Главная страница */}
          <Route path="/" element={<HomePage />} />
          
          {/* Страница деталей игры */}
          <Route path="/game/:id" element={<GameDetailsPage />} />
          
          {/* Избранное - только для авторизованных */}
          <Route path="/favorites" element={
            <ProtectedRoute requireAuth={true} redirectTo="/auth">
              <FavoritesPage />
            </ProtectedRoute>
          } />
          
          {/* Профиль - только для авторизованных */}
          <Route path="/profile" element={
            <ProtectedRoute requireAuth={true} redirectTo="/auth">
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* 404 - страница не найдена */}
          <Route path="*" element={
            <div className="not-found-page">
              <h2>404 - Страница не найдена</h2>
              <p>Извините, запрашиваемая страница не существует.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

// Главный компонент App
const App: React.FC = () => {
  return (
    <Provider store={store}>
      {/* Инициализатор для проверки авторизации */}
      <AppInitializer />
      
      {/* Основное содержимое приложения */}
      <AppContent />
    </Provider>
  );
};

export default App;