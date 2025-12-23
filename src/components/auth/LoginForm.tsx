import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import './AuthForms.css';

interface LoginFormProps {
  switchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      // Успешный вход - перенаправляем на главную
      await navigate('/');
    } catch (err: unknown) {
      setError(err || 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSubmit(e); // Явно игнорируем промис с void
  };

  return (
    <div className="auth-form">
      <h2>Вход в аккаунт</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleFormSubmit}>
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <div className="form-footer">
          <span>Нет аккаунта?</span>
          <button type="button" className="switch-btn" onClick={switchToRegister}>
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
