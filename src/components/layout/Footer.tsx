import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
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
              <li><a href="#">Action</a></li>
              <li><a href="#">RPG</a></li>
              <li><a href="#">Strategy</a></li>
              <li><a href="#">Adventure</a></li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4>Платформы</h4>
            <ul>
              <li><a href="#">PC</a></li>
              <li><a href="#">PlayStation</a></li>
              <li><a href="#">Xbox</a></li>
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