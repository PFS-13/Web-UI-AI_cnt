import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import { useAuth } from '../../../hooks';
import styles from '../styles/Auth.module.css';
import { authAPI } from '../../../services';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const {  isLoading, clearError } = useAuth();
  const location = useLocation();
  // Load email from state on component mount
  useEffect(() => {
    const email_user = location.state.email || {};
    if (email_user) {
      setEmail(email_user);
    } else {
      navigate('/login');
    }
  }, []);

  // Auto focus ketika error muncul
  useEffect(() => {
    if (emailError && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [emailError]);


  const handleEditEmail = () => {
    navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    clearError();

    // Validasi email kosong
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email is not valid.');
      return;
    }

    // Validasi password kosong
    if (!password.trim()) {
      return;
    }

    // Validasi panjang password
    if (password.length < 12) {
      return;
    }

    try {
      await authAPI.register({ email, password });
      navigate('/verification', { state: { email } });
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Registrasi gagal: ' + errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>
            Set your password for WebUI AI to continue
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.floatingLabelContainer}>
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                value={email}
                disabled
                className={`${styles.formInput} ${styles.emailDisabled}`}
                placeholder=""
              />
              <label
                htmlFor="email"
                className={`${styles.floatingLabel} ${styles.floatingLabelActive}`}
              >
                Email address
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

            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`${styles.formInput} ${styles.password}`}
                  placeholder=""
                />
                <label
                  htmlFor="password"
                  className={`${styles.floatingLabel} ${(isPasswordFocused || password) ? styles.floatingLabelActive : ''} ${isPasswordFocused ? styles.focused : ''}`}
                >
                  Password
                </label>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
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
              
              {/* Password Requirements */}
              <div className={styles.passwordRequirements}>
                <div className={styles.requirementTitle}>Your password must contain:</div>
                <div className={`${styles.requirementItem} ${password.length >= 12 ? styles.requirementMet : styles.requirementNotMet}`}>
                  At least 12 characters
                </div>
              </div>
              
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

export default Register;
