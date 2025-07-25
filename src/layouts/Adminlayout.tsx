import { useState } from 'react'; // Import useState
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/AdminLayout.module.css';
import logo from '../assets/skonnect-logo-white.png';

const AdminLayout = () => {
  const navigate = useNavigate();
  // Initialize sidebar as CLOSED by default. CSS will open it on desktop.
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/signin');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.adminLayoutContainer}>
      {/* Overlay for mobile sidebar: visible when sidebar is open */}
      {sidebarOpen && <div className={`${styles.overlay} ${sidebarOpen ? styles.active : ''}`} onClick={closeSidebar}></div>}

      {/* The Admin Sidebar */}
      {/* Apply .open / .closed based on state. CSS will handle desktop default open. */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <img src={logo} alt="sKonnect Logo" className={styles.logo} />
          {/* Close button inside sidebar, primarily for mobile overlay */}
          <button className={styles.closebtn} onClick={closeSidebar}>
            &times;
          </button>
        </div>
        
        <div className={styles.navLinks}>
          <NavLink to="/admin/home" onClick={closeSidebar}>Dashboard</NavLink>
          <NavLink to="/admin/officials" onClick={closeSidebar}>Officials</NavLink>
          <NavLink to="/admin/requests" onClick={closeSidebar}>Document Requests</NavLink>
          <NavLink to="/admin/announcements" onClick={closeSidebar}>Announcements</NavLink>
          <NavLink to="/admin/comments" onClick={closeSidebar}>Comments</NavLink>
          <NavLink to="/admin/logs" onClick={closeSidebar}>Admin Logs</NavLink>
        </div>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      {/* The main content area including the fixed header */}
      <div className={styles.mainContent}>
        {/* Fixed Header for Admin Section */}
        <header className={styles.adminHeader}>
          {/* Hamburger menu button for mobile, positioned within header - MOVED TO BE FIRST */}
          <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
            ☰
          </button>
          <span className={styles.adminHeaderTitle}>Admin Dashboard</span>
        </header>
        
        {/* Outlet for nested routes (actual page content) */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;