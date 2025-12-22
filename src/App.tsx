import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import GameDetailsPage from './pages/GameDetailsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false}>
              <AuthPage />
            </ProtectedRoute>
          } />
          
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="game/:id" element={<GameDetailsPage />} />
            
            <Route path="favorites" element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<div>Страница не найдена</div>} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;