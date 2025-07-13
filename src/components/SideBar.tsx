import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../componentstyles/Sidebar.module.css';

// Define the props the component will accept
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        {/* Show full logo or initial based on state */}
        {isCollapsed ? 'SK' : 'sKonnect'}
      </div>
      <nav className={styles.nav}>
        <NavLink to="/admin" className={styles.link}>
          <span className={styles.icon}>D</span> {/* Placeholder for an icon */}
          <span className={styles.text}>Dashboard</span>
        </NavLink>
        <NavLink to="/testing" className={styles.link}>
          <span className={styles.icon}>T</span> {/* Placeholder for an icon */}
          <span className={styles.text}>API Testing</span>
        </NavLink>
      </nav>
      {/* The collapse button is now part of the sidebar */}
      <button onClick={toggleSidebar} className={styles.collapseButton}>
        {isCollapsed ? '»' : '«'}
      </button>
    </aside>
  );
};

export default Sidebar;