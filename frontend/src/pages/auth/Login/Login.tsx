import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import { useAuth } from '../../../hooks';
import styles from '../styles/Auth.module.css';
import { authAPI } from '../../../services/api/auth.api';
  

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 👈 tambahan

  const emailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { } = useAuth();

    useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await authAPI.getMe();
        if (me) {
          navigate('/dashboard', { replace: true }); // langsung redirect tanpa flicker
        } else {
          setIsCheckingAuth(false); // belum login, render halaman login
        }
      } catch (error) {
        setIsCheckingAuth(false); // error (misalnya 401), tetap render login
      }
    };

    checkAuth();
  }, [navigate]);


  // Auto focus ketika error muncul
  useEffect(() => {
    if (emailError && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [emailError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validasi email kosong
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email is not valid.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.checkEmail(email);
      console.log('Check email response:', response);
      if (response.provider == 'google') {
        window.location.href = `http://localhost:3001/auth/google?email=${encodeURIComponent(email)}`;
      } else if(response.provider == 'manual') {
        navigate('/input-password', { state: { email } });
      } else {
        navigate('/register', { state: { email } });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailError('Failed to check email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  const handleMicrosoftLogin = () => {
    // Implement Microsoft login
    console.log('Microsoft login clicked');
  };

  const handleAppleLogin = () => {
    // Implement Apple login
    console.log('Apple login clicked');
  };

  const handlePhoneLogin = () => {
    // Implement phone login
    console.log('Phone login clicked');
  };
  if (isCheckingAuth) {
    return (
      <div className={styles.container}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome to WebUI AI</h1>
          <p className={styles.subtitle}>
            You'll get smarter responses and can upload files, images, and more.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    
                    // Clear error saat user mengetik
                    if (emailError) setEmailError('');
                    
                    // Validasi real-time untuk format email
                    if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      setEmailError('Email is not valid.');
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                        className={`${styles.formInput} ${emailError ? styles.formInputError : ''}`}
                  placeholder=""
                />
                <label 
                  htmlFor="email" 
                  className={`${styles.floatingLabel} ${(isFocused || email) ? styles.floatingLabelActive : ''} ${isFocused ? styles.focused : ''} ${emailError ? styles.floatingLabelError : ''}`}
                >
                  Email address
                </label>
              </div>
              {emailError && (
                <div className={styles.errorMessage}>
                  {emailError}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isLoading}
              className={styles.continueButton}
            >
              {isLoading ? 'Continue...' : 'Continue'}
            </Button>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className={styles.socialButton}
              >
                <div className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path

                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleMicrosoftLogin}
                className={styles.socialButton}
              >
                <div className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                  </svg>
                </div>
                Continue with Microsoft Account
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                className={styles.socialButton}
              >
                <div className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                Continue with Apple
              </button>

              <button
                type="button"
                onClick={handlePhoneLogin}
                className={styles.socialButton}
              >
                <div className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                Continue with phone
              </button>
            </div>
          </form>

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

export default Login;
