import React from 'react';
import styles from './AuthHeader.module.css';

export interface AuthHeaderProps {
  className?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ className = '' }) => {
  const headerClasses = [
    styles.header,
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.logo}>WebUI AI</div>
    </header>
  );
};

export default AuthHeader;


