import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import GameDetailsPage from './pages/GameDetailsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/wishlist" element={<FavoritesPage />} /> {/* Временно */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/game/:id" element={<GameDetailsPage />} />
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;