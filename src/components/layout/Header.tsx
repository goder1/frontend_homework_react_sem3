// src/components/layout/Header.tsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <h1>Game<span>Catalog</span></h1>
            <p className={styles.tagline}>Ваш гид в мире видеоигр</p>
          </Link>

          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  end
                >
                  Каталог
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/favorites" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  Избранное
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => 
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
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