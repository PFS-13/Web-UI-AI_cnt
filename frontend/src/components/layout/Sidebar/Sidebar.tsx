import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className = '', 
  isCollapsed = false,
  onToggle 
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Chat', href: '/chat', icon: '💬' },
    { name: 'History', href: '/conversations', icon: '📚' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const sidebarClasses = [
    styles.sidebar,
    isCollapsed && styles.collapsed,
    className,
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClasses}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🤖</span>
          {!isCollapsed && (
            <span className={styles.logoText}>Web-UI-AI</span>
          )}
        </div>
        {onToggle && (
          <button
            className={styles.toggleButton}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`${styles.navLink} ${isActivePath(item.href) ? styles.active : ''}`}
            title={isCollapsed ? item.name : undefined}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!isCollapsed && (
              <span className={styles.navText}>{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.image_url ? (
              <img
                src={user.image_url}
                alt={user.username || user.email}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarInitials}>
                {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {user?.username || user?.email}
              </span>
              <span className={styles.userEmail}>
                {user?.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
