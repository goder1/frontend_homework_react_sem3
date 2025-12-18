import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link to="/">
              <h1>Game<span>Catalog</span></h1>
              <p>Ваш гид в мире видеоигр</p>
            </Link>
          </div>
          
          <nav className={styles.nav}>
            <ul>
              <li>
                <NavLink 
                  to="/" 
                  end
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  Каталог
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/favorites"
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  Избранное
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/wishlist"
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  Желаемое
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/profile"
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  Профиль
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;