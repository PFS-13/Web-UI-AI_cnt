import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../common';
import { useAuth } from '../../../hooks';
import { getInitials } from '../../../utils/helpers';
import styles from './Header.module.css';

export interface HeaderProps {
  className?: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  className = '', 
  onToggleSidebar,
  isSidebarOpen = false 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Chat', href: '/chat', icon: '💬' },
    { name: 'History', href: '/conversations', icon: '📚' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };


  const handleShareClick = () => {
    // Function placeholder - to be implemented
  };

  const headerClasses = [
    styles.header,
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} role="banner">
      <div className={styles.container}>
        {/* Desktop Logo */}
        <div className={styles.logo}>
          <Link 
            to="/" 
            className={styles.logoLink}
            aria-label="WebUI AI - Go to homepage"
          >
            <span className={styles.logoIcon} aria-hidden="true">🤖</span>
            <span className={styles.logoText}>Web-UI-AI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav} role="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${styles.navLink} ${isActivePath(item.href) ? styles.active : ''}`}
              aria-current={isActivePath(item.href) ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span className={styles.navText}>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop User Section */}
        <div className={styles.userSection}>
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
                  {getInitials(user?.username || user?.email || 'U')}
                </span>
              )}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {user?.username || user?.email}
              </span>
              <span className={styles.userEmail}>
                {user?.email}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="small"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className={styles.mobileControls}>
          {/* Mobile Hamburger Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span className={styles.menuIcon}>
              {isSidebarOpen ? '✕' : '☰'}
            </span>
          </button>

          {/* Mobile Share Button */}
          <button
            className={styles.mobileShareButton}
            onClick={handleShareClick}
            aria-label="Share"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span className={styles.shareText}>Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
