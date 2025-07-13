import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from '../layoutstyles/AdminLayout.module.css';

import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const AdminLayout: React.FC = () => {
  // State for collapse will be managed here to be passed to Sidebar
  // and to adjust the main layout grid.
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div 
      className={styles.adminLayout}
      style={{
        // Dynamically set the grid template based on the collapsed state
        '--sidebar-width': isSidebarCollapsed ? '80px' : '250px'
      } as React.CSSProperties}
    >
      <div className={styles.leftColumn}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <Footer isCollapsed={isSidebarCollapsed} />
      </div>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;