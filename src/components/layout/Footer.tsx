import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    // Переходим на главную страницу с параметром фильтра
    navigate('/', { 
      state: { 
        filter: {
          type: 'genre',
          value: category
        }
      } 
    });
  };

  const handlePlatformClick = (platform: string) => {
    // Переходим на главную страницу с параметром платформы
    navigate('/', { 
      state: { 
        filter: {
          type: 'platform',
          value: platform
        }
      } 
    });
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>GameCatalog</h3>
            <p>Лучший каталог видеоигр для настоящих геймеров</p>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Категории</h4>
            <ul>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleCategoryClick('Action')}
                >
                  Action
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleCategoryClick('RPG')}
                >
                  RPG
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleCategoryClick('Strategy')}
                >
                  Strategy
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handleCategoryClick('Adventure')}
                >
                  Adventure
                </button>
              </li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Платформы</h4>
            <ul>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handlePlatformClick('PC')}
                >
                  PC
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handlePlatformClick('PS5')}
                >
                  PlayStation
                </button>
              </li>
              <li>
                <button 
                  className={styles.footerLink}
                  onClick={() => handlePlatformClick('Xbox')}
                >
                  Xbox
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} GameCatalog. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;