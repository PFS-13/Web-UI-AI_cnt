import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  ...props
}, ref) => {
  const inputClasses = [
    styles.input,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    error && styles.error,
    className,
  ].filter(Boolean).join(' ');

  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {startIcon && (
          <span className={styles.startIcon}>
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {endIcon && (
          <span className={styles.endIcon}>
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <span className={styles.errorText}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className={styles.helperText}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
