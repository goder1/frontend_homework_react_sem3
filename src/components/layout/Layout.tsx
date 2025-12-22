import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <a href="/presentation" className="presentation-link">
        📊 Презентация
      </a>
      <Header />
      <main className={styles.mainContent}>
        <Outlet /> {/* Заменяем children на Outlet */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;