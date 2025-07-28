import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/MainLayout.module.css';
import logo from '../assets/skonnect-logo.png';
import PageLoader from '../components/PageLoader'; // Import the new loader component
// import footerLogo from '../assets/3.png'; // NEW: Import the 3.png image
import footerLogo from '../assets/BayanngMalitbog.png'; // NEW: Import the 3.png image

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // NEW: Loading state
  const navigate = useNavigate();

  const openNav = () => setSidebarOpen(true);
  const closeNav = () => setSidebarOpen(false);

  const handleSignInClick = () => {
    closeNav();
    navigate('/signin');
  };

  // NEW: Simulate page loading
  useEffect(() => {
    // In a real app, this would be tied to actual data fetching or initial component mounts.
    // For demonstration, we'll simulate a 1.5-second load time.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  // You might also reset loading state on navigation changes if pages fetch data
  // useEffect(() => {
  //   setIsLoading(true); // Set loading to true on route change
  //   const timer = setTimeout(() => setIsLoading(false), 500); // Simulate load for new page
  //   return () => clearTimeout(timer);
  // }, [location.pathname]); // Listen to route changes

  return (
    <div className={styles.layoutContainer}>
      {isLoading && <PageLoader />} {/* NEW: Conditionally render loader */}

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
            <NavLink to="/document-requests" onClick={closeNav}>Document Requests</NavLink>

            <NavLink to="/about" onClick={closeNav}>About Us</NavLink>
        </div>
        <div className={styles.sidebarFooter}>
          <button onClick={handleSignInClick} className={styles.signinBtn}>
            Sign In
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <header className={styles.appHeader}>
          <button className={styles.openbtn} onClick={openNav}>
            ☰
          </button>
        </header>

        <main className={styles.main}>
          <div className={styles.innerContentWrapper}>
            <div className={styles.pageContent}>
              <Outlet />
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogoSection}>
              <img src={footerLogo} alt="Barangay Logo" className={styles.footerImage} /> {/* NEW: Footer image */}
              <h3>Bayan ng Malitbog, Barangay Sta Cruz</h3>
            </div>
            <div className={styles.footerInfo}>
              <h4>Contact Information</h4>
              <p>📞 (To be Added)</p>
              <p>📞 (To be Added)</p>
              <p>✉️ (To be Added)</p>
              <p>📍 6X6H+P72, Santa Cruz, Malitbog, Southern Leyte</p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Site Links</h4>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/announcements">Announcements</Link>
              <Link to="/officials">Officials</Link>
              <Link to="/document-requests">Document Requests</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;