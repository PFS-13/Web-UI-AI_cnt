import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import styles from '../styles/Auth.module.css';
import { authAPI } from '../../../services';

const InputPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load email from state on component mount
  useEffect(() => {
    const emailFromState = location.state?.email || '';
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      navigate('/login');
    }
  }, [location.state, navigate]);

  // Auto focus ketika error muncul
  useEffect(() => {
    if (passwordError && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [passwordError]);

  const handleEditEmail = () => {
    navigate('/login', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setIsLoading(true);

    // Validasi password kosong
    if (!password.trim()) {
      setPasswordError('Password is required.');
      setIsLoading(false);
      return;
    }

    // Validasi panjang password minimal 6 karakter
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setPasswordError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) setPasswordError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Enter your password for{' '}
            <span className={styles.emailText}>{email}</span>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email Display (Read-only) */}
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  className={`${styles.formInput} ${styles.emailDisabled}`}
                  placeholder=""
                  disabled
                />
                <label
                  htmlFor="email"
                  className={`${styles.floatingLabel} ${styles.floatingLabelActive}`}
                >
                  Email
                </label>
                <button
                  type="button"
                  onClick={handleEditEmail}
                  className={styles.editButton}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`${styles.formInput} ${styles.password} ${passwordError ? styles.formInputError : ''}`}
                  placeholder=""
                />
                <label
                  htmlFor="password"
                  className={`${styles.floatingLabel} ${(isPasswordFocused || password) ? styles.floatingLabelActive : ''} ${isPasswordFocused ? styles.focused : ''} ${passwordError ? styles.floatingLabelError : ''}`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
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

            {/* Forgot Password Link */}
            <div className={styles.forgotPasswordContainer}>
              <button 
                type="button" 
                onClick={() => navigate('/reset-password')} 
                className={styles.forgotPasswordLink}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              className={styles.continueButton}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className={styles.linkContainer}>
            <button 
              type="button" 
              onClick={handleEditEmail} 
              className={styles.textButton}
            >
              Back to login
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className={styles.termsContainer}>
            <span className={styles.termsText}>
              By clicking "Continue", you agree to our{' '}
              <a href="#" className={styles.termsLink}>Terms</a>
              {' '}and have read our{' '}
              <a href="#" className={styles.termsLink}>Privacy Policy</a>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPassword;
