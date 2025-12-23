// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  selectCurrentUser,
  selectAuthLoading,
  selectIsInitialized,
  checkAuth,
} from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth',
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    // Проверяем авторизацию при монтировании, если еще не инициализировано
    const verifyAuth = async () => {
      if (!isInitialized && !isLoading) {
        try {
          await dispatch(checkAuth()).unwrap();
        } catch (error) {
          // Логируем ошибку только в development
          if (process.env.NODE_ENV === 'development') {
            console.error('Auth check failed:', error);
          }
        }
      }
    };

    void verifyAuth(); // Явно игнорируем промис с void
  }, [dispatch, isInitialized, isLoading]);

  // Пока идет проверка авторизации
  if (isLoading || !isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  // Требуется авторизация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Не требуется авторизация, но пользователь авторизован
  if (!requireAuth && isAuthenticated) {
    const from = (location.state as { from?: string })?.from || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
