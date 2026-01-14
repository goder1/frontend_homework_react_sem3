//// src/components/games/GameCard.test.tsx
//import React from 'react';
//import { render, screen, fireEvent } from '@testing-library/react';
//import { Provider } from 'react-redux';
//import { configureStore } from '@reduxjs/toolkit';
//import { BrowserRouter } from 'react-router-dom';
//import GameCard from './GameCard';
//import favoritesReducer from '../../store/slices/favoritesSlice';
//
//const mockGame = {
//  id: '1',
//  title: 'Test Game',
//  description: 'Test Description',
//  image_url: 'test.jpg',
//  rating: 4.5,
//  price: 59.99,
//  release_date: '2023-01-01',
//  platforms: ['PC', 'PlayStation'],
//  genres: ['Action', 'RPG'],
//};
//
//const mockStore = configureStore({
//  reducer: {
//    favorites: favoritesReducer,
//  },
//  preloadedState: {
//    favorites: {
//      favorites: [],
//      loading: false,
//      error: null,
//    },
//  },
//});
//
//describe('GameCard Component', () => {
//  test('отображает заголовок игры', () => {
//    render(
//      <Provider store={mockStore}>
//        <BrowserRouter>
//          <GameCard game={mockGame} />
//        </BrowserRouter>
//      </Provider>
//    );
//
//    expect(screen.getByText('Test Game')).toBeInTheDocument();
//  });
//
//  test('отображает рейтинг игры', () => {
//    render(
//      <Provider store={mockStore}>
//        <BrowserRouter>
//          <GameCard game={mockGame} />
//        </BrowserRouter>
//      </Provider>
//    );
//
//    expect(screen.getByText('4.5')).toBeInTheDocument();
//  });
//
//  test('отображает платформы игры', () => {
//    render(
//      <Provider store={mockStore}>
//        <BrowserRouter>
//          <GameCard game={mockGame} />
//        </BrowserRouter>
//      </Provider>
//    );
//
//    expect(screen.getByText('PC')).toBeInTheDocument();
//    expect(screen.getByText('PlayStation')).toBeInTheDocument();
//  });
//
//  test('кнопка "Подробнее" присутствует', () => {
//    render(
//      <Provider store={mockStore}>
//        <BrowserRouter>
//          <GameCard game={mockGame} />
//        </BrowserRouter>
//      </Provider>
//    );
//
//    expect(screen.getByText('Подробнее')).toBeInTheDocument();
//  });
//});