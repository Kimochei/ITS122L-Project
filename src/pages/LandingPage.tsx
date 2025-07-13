import React from 'react';
import styles from '../pagestyles/LandingPage.module.css'; 

const LandingPage: React.FC = () => {
  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h2 className={styles.heroTitle}>The Best Way to Manage Your Content</h2>
        <p className={styles.heroSubtitle}>
          An intuitive, powerful, and fast solution for all your needs.
        </p>
        <button className={styles.ctaButton}>Get Started</button>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>Feature One</h3>
          <p>Description of an amazing feature that will attract users.</p>
        </div>
        <div className={styles.feature}>
          <h3>Feature Two</h3>
          <p>Description of another compelling feature of your application.</p>
        </div>
        <div className={styles.feature}>
          <h3>Feature Three</h3>
          <p>Highlight a third key benefit that makes your product stand out.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;