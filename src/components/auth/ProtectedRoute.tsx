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
  
  useEffect(() => {
    if (!isInitialized) {
      dispatch(checkAuth());
    }
  }, [dispatch, isInitialized]);
  
  if (!isInitialized || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;