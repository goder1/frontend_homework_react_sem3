import React, { useState } from 'react';
import AuthService from '../../services/authService';
import './AuthForms.css';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(
        formData.email,
        formData.password
      );

      if (result.success) {
        onSuccess?.(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Вход в аккаунт</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
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
            placeholder="Введите пароль"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <div className="form-footer">
          <span>Нет аккаунта?</span>
          <button 
            type="button" 
            className="switch-btn"
            onClick={switchToRegister}
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;