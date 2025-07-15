import React from 'react';
import styles from '../pagestyles/LandingPage.module.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    // The wrapping div is no longer needed here
    <>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>sKonnect</h1>
          <p>The Barangay Portal</p>
        </div>
      </header>

      <section className={styles.mainContent}>
        <div className={styles.intro}>
          <h2>The Best Way to Manage Your Content</h2>
          <p>An intuitive, powerful, and fast solution for all your needs.</p>
          <button onClick={() => navigate('/announcements')} className={styles.ctaButton}>
            Get Started
          </button>
        </div>
        <div className={styles.features}>
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
        </div>
      </section>

      {/* The footer section has been removed from here */}
    </>
  );
};

export default LandingPage;