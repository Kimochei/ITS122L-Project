import React from 'react';
import styles from '../componentstyles/Footer.module.css';

interface FooterProps {
  isCollapsed: boolean;
}

const Footer: React.FC<FooterProps> = ({ isCollapsed }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.content}>
        <p>&copy; {currentYear}</p>
        <p className={styles.text}>sKonnect</p>
      </div>
    </footer>
  );
};

export default Footer;