import { useState } from 'react'; // Import useState
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/AdminLayout.module.css';
import logo from '../assets/skonnect-logo-white.png';

const AdminLayout = () => {
  const navigate = useNavigate();
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
      {sidebarOpen && <div className={`${styles.overlay} ${sidebarOpen ? styles.active : ''}`} onClick={closeSidebar}></div>}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <img src={logo} alt="sKonnect Logo" className={styles.logo} />
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

      <div className={styles.mainContent}>
        <header className={styles.adminHeader}>
          <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
            ☰
          </button>
          <span className={styles.adminHeaderTitle}>Admin Dashboard</span>
        </header>
        
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;