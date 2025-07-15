import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/MainLayout.module.css';
import logo from '../assets/skonnect-logo.png';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const openNav = () => setSidebarOpen(true);
  const closeNav = () => setSidebarOpen(false);

  const handleSignInClick = () => {
    closeNav();
    navigate('/signin');
  };

  return (
    <div className={styles.layoutContainer}>
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <img src={logo} alt="sKonnect Logo" className={styles.logo} />
          <button className={styles.closebtn} onClick={closeNav}>
            &times;
          </button>
        </div>
        <div className={styles.navLinks}>
          <NavLink to="/" onClick={closeNav}>Home</NavLink>
          <NavLink to="/announcements" onClick={closeNav}>Announcements</NavLink>
          <NavLink to="/officials" onClick={closeNav}>Barangay Officials</NavLink>
          {/* 👇 NEW LINK ADDED HERE 👇 */}
          <NavLink to="/document-requests" onClick={closeNav}>Document Requests</NavLink>
          <NavLink to="/about" onClick={closeNav}>About Us</NavLink>
          <NavLink to="/contact" onClick={closeNav}>Contact Us</NavLink>
        </div>
        <div className={styles.sidebarFooter}>
          <button onClick={handleSignInClick} className={styles.signinBtn}>
            Sign In
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <button className={styles.openbtn} onClick={openNav}>
          &#9776;
        </button>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogoSection}>
            <div className={styles.logoPlaceholder}></div>
            <h3>Barangay [Name]</h3>
          </div>
          <div className={styles.footerInfo}>
            <h4>Contact Information</h4>
            <p>📞 Number (Position) </p>
            <p>📞 Tel No. (Organization)</p>
            <p>✉️ email (Email)</p>
            <p>📍 (Specific Address), (Barangay), (Municipality), (Province), (Zip code)</p>
          </div>
          <div className={styles.footerLinks}>
            <h4>Site Links</h4>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/announcements">Announcements</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;