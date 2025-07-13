import React from 'react';
import styles from '../componentstyles/Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1>Admin Dashboard</h1>
    </header>
  );
};

export default Header;