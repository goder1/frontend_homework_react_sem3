// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  selectCurrentUser, 
  selectAuthLoading, 
  selectIsInitialized,
  checkAuth 
} from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth'
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const currentUser = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isAuthenticated = !!currentUser;
  
  console.log('ProtectedRoute debug:', {
    currentUser,
    isLoading,
    isInitialized,
    isAuthenticated,
    requireAuth,
    pathname: location.pathname,
  });
  
  useEffect(() => {
    // Проверяем авторизацию при монтировании, если еще не инициализировано
    if (!isInitialized && !isLoading) {
      console.log('ProtectedRoute: Checking auth...');
      dispatch(checkAuth());
    }
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
    console.log('ProtectedRoute: Redirecting to auth - not authenticated');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // Не требуется авторизация, но пользователь авторизован
  if (!requireAuth && isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to profile - already authenticated');
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }
  
  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;