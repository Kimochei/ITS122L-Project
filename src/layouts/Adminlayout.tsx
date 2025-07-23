import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/AdminLayout.module.css';
import logo from '../assets/skonnect-logo-white.png';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/signin');
  };

  return (
    <div className={styles.layoutContainer}>
      {/* The static sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src={logo} alt="sKonnect Logo" className={styles.logo} />
        </div>
        
        <div className={styles.navLinks}>
          <NavLink to="/admin/home">Dashboard</NavLink>
          <NavLink to="/admin/officials">Officials</NavLink>
          <NavLink to="/admin/requests">Document Requests</NavLink>
          <NavLink to="/admin/announcements">Announcements</NavLink>
          <NavLink to="/admin/comments">Comments</NavLink>
          <NavLink to="/admin/logs">Admin Logs</NavLink>
        </div>
        
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* The main content area */}
      <main className={styles.mainContent}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;