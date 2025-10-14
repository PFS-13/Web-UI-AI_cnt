import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../common';
import { useAuth } from '../../../hooks';
import { getInitials } from '../../../utils/helpers';
import styles from './Header.module.css';

export interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const headerClasses = [
    styles.header,
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoIcon}>🤖</span>
            <span className={styles.logoText}>Web-UI-AI</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${styles.navLink} ${isActivePath(item.href) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.name}</span>
            </Link>
          ))}
        </nav>

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

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}>
              {isMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNav}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${styles.mobileNavLink} ${isActivePath(item.href) ? styles.active : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.mobileNavIcon}>{item.icon}</span>
                <span className={styles.mobileNavText}>{item.name}</span>
              </Link>
            ))}
          </div>
          <div className={styles.mobileActions}>
            <Button
              variant="secondary"
              size="medium"
              onClick={handleLogout}
              className={styles.mobileLogoutButton}
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
