import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      {message && (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
