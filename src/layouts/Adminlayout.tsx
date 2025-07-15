import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from '../layoutstyles/AdminLayout.module.css';
import logo from '../assets/skonnect-logo-white.png';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/signin');
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Admin Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <img src={logo} alt="sKonnect Logo" className={styles.logo} />
          {/* This button is now only for closing, positioned inside */}
          <button onClick={toggleSidebar} className={styles.closeBtn}>×</button>
        </div>
        
        <div className={styles.navLinks}>
          <NavLink to="/admin/home">Dashboard</NavLink>                                                  
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

      {/* Main Content Area */}
      {/* The 'shifted' class now controls the margin */}
      <main className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}>
        {/* This button is now only for opening, stays in the content area */}
        {!sidebarOpen && (
          <button onClick={toggleSidebar} className={styles.openBtn}>
            ›
          </button>
        )}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;