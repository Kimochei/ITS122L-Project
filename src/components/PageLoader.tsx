import React from 'react';
import styles from '../componentstyles/PageLoader.module.css';

const PageLoader: React.FC = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderSpinner}></div>
    </div>
  );
};

export default PageLoader;