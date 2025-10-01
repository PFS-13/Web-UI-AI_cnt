import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import styles from '../styles/Auth.module.css';

const NewPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');

    // Validasi password kosong
    if (!newPassword.trim()) {
      setPasswordError('Password is required.');
      return;
    }

    // Validasi panjang password
    if (newPassword.length < 12) {
      setPasswordError('Password must be at least 12 characters.');
      return;
    }

    // Validasi confirm password kosong
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password.');
      return;
    }

    // Validasi password match
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call untuk reset password
      console.log('Setting new password:', newPassword);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Redirect ke login setelah berhasil
      navigate('/login');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.subtitle}>
            Enter a new password below to change your password
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* New Password Field */}
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={newPasswordInputRef}
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPassword(value);
                  }}
                  onFocus={() => setIsNewPasswordFocused(true)}
                  onBlur={() => setIsNewPasswordFocused(false)}
                  className={`${styles.formInput} ${styles.password} ${passwordError ? styles.formInputError : ''}`}
                  placeholder=""
                />
                <label
                  htmlFor="newPassword"
                  className={`${styles.floatingLabel} ${(isNewPasswordFocused || newPassword) ? styles.floatingLabelActive : ''} ${isNewPasswordFocused ? styles.focused : ''} ${passwordError ? styles.floatingLabelError : ''}`}
                >
                  New password
                </label>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {passwordError && (
                <div className={styles.errorMessage}>
                  {passwordError}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={confirmPasswordInputRef}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                  }}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  className={`${styles.formInput} ${styles.password} ${confirmPasswordError ? styles.formInputError : ''}`}
                  placeholder=""
                />
                <label
                  htmlFor="confirmPassword"
                  className={`${styles.floatingLabel} ${(isConfirmPasswordFocused || confirmPassword) ? styles.floatingLabelActive : ''} ${isConfirmPasswordFocused ? styles.focused : ''} ${confirmPasswordError ? styles.floatingLabelError : ''}`}
                >
                  Re-enter new password
                </label>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {confirmPasswordError && (
                <div className={styles.errorMessage}>
                  {confirmPasswordError}
                </div>
              )}
            </div>

            {/* Password Requirements - Moved here */}
            <div className={styles.passwordRequirements}>
              <div className={styles.requirementTitle}>Your password must contain:</div>
              <div className={`${styles.requirementItem} ${newPassword.length >= 12 ? styles.requirementMet : styles.requirementNotMet}`}>
                At least 12 characters
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              className={styles.continueButton}
            >
              {isLoading ? 'Setting password...' : 'Continue'}
            </Button>
          </form>

          <div className={styles.linkContainer}>
            <button 
              type="button" 
              onClick={handleBackToLogin} 
              className={styles.textButton}
            >
              Back to login
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className={styles.termsContainer}>
            <a href="#" className={styles.termsLink}>Terms of Use</a>
            <span className={styles.termsSeparator}>|</span>
            <a href="#" className={styles.termsLink}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;