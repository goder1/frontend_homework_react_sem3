import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';
import './AuthPage.module.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (user: any) => {
    console.log('Аутентификация успешна:', user);
    navigate('/'); // Перенаправляем на главную
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm 
            switchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess}
            switchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;