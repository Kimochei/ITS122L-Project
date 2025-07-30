import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/MainLayout.module.css';
import PageLoader from '../components/PageLoader';
import footerLogo from '../assets/BayanngMalitbog.png';

// bootstrap components
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const MainLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSignInClick = () => {
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
      {isLoading && <PageLoader />}

      <div className={styles.contentWrapper}>
        {/* navbar */}
        <header>
          <Navbar expand="lg" className={styles.appHeader} fixed='top' variant='dark'>
            <Container>
              <Navbar.Brand>
                <img
                  alt="Bayan ng Malitbog Logo"
                  src={footerLogo}
                  width="35"
                  height="35"
                  className="d-inline-block align-top"
                />{' '}<b className={styles.headerTitle}>Bayan ng Malitbog, Brgy. Sta Cruz</b></Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav variant="pills" className={styles.navLinks + " me-auto"}>
                  <Nav.Link onClick={() => { navigate('/') }}>Home</Nav.Link>
                  <Nav.Link onClick={() => { navigate('/announcements') }}>Announcements</Nav.Link>
                  <Nav.Link onClick={() => { navigate('/officials') }}>Barangay Officials</Nav.Link>
                  <Nav.Link onClick={() => { navigate('/document-requests') }}>Document Requests</Nav.Link>
                  <Nav.Link onClick={() => { navigate('/about') }}>About</Nav.Link>
                </Nav>
                <Form className="d-flex">
                  <Button onClick={handleSignInClick} className={styles.signinBtn}>Sign In</Button>
                </Form>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        {/* content */}
        <main className={styles.main}>
          <div className={styles.innerContentWrapper}>
            <div className={styles.pageContent}>
              <Outlet />
            </div>
          </div>
        </main>

        {/* footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogoSection}>
              <img src={footerLogo} alt="Barangay Logo" className={styles.footerImage} />
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