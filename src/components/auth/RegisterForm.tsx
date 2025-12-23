import React, { useState, ChangeEvent, FormEvent } from 'react';
import AuthService from '../../services/authService';
import { useAppDispatch } from '../../store/hooks';
import './AuthForms.css';

interface RegisterFormProps {
  onSuccess?: (user: any) => void;
  switchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, switchToLogin }) => {
  useAppDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        onSuccess?.(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Регистрация</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            placeholder="Введите имя пользователя"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@mail.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Не менее 6 символов"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Повторите пароль"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <div className="form-footer">
          <span>Уже есть аккаунт?</span>
          <button 
            type="button" 
            className="switch-btn"
            onClick={switchToLogin}
          >
            Войти
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;