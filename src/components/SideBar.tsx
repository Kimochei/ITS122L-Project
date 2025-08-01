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
        {isCollapsed ? 'SK' : 'sKonnect'}
      </div>
      <nav className={styles.nav}>
        <NavLink to="/admin" className={styles.link}>
          <span className={styles.icon}>D</span> 
          <span className={styles.text}>Dashboard</span>
        </NavLink>
        <NavLink to="/testing" className={styles.link}>
          <span className={styles.icon}>T</span> 
          <span className={styles.text}>API Testing</span>
        </NavLink>
      </nav>
      <button onClick={toggleSidebar} className={styles.collapseButton}>
        {isCollapsed ? '»' : '«'}
      </button>
    </aside>
  );
};

export default Sidebar;