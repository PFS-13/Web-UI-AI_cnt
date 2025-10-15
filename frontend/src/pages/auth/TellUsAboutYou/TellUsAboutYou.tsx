import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import { validateFullName } from '../../../utils/userProfile';
import styles from '../styles/Auth.module.css';
import { authAPI } from '../../../services';

const TellUsAboutYou: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [fullNameError, setFullNameError] = useState('');

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  // Auto focus ketika error muncul
  useEffect(() => {
    if (fullNameError && fullNameInputRef.current) {
      fullNameInputRef.current.focus();
    }
  }, [fullNameError]);

  const validateFullNameLocal = (name: string): boolean => {
    const validation = validateFullName(name);
    if (!validation.isValid) {
      setFullNameError(validation.error || '');
      return false;
    }
    setFullNameError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFullNameError('');
    
    // Validate inputs
    const isFullNameValid = validateFullNameLocal(fullName);
    
    if (!isFullNameValid) {
      return;
    }
    
    setIsFormLoading(true);
    
    try {
      await authAPI.changeUsername(fullName, (await authAPI.getMe()).id);
      navigate('/');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      // Handle error jika diperlukan
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    if (fullNameError) setFullNameError('');
  };

  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Tell us about you</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Full Name Input */}
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                <input
                  ref={fullNameInputRef}
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  onFocus={() => setIsFullNameFocused(true)}
                  onBlur={() => setIsFullNameFocused(false)}
                  className={`${styles.formInput} ${fullNameError ? styles.formInputError : ''}`}
                  placeholder=""
                />
                <label
                  htmlFor="fullName"
                  className={`${styles.floatingLabel} ${(isFullNameFocused || fullName) ? styles.floatingLabelActive : ''} ${isFullNameFocused ? styles.focused : ''} ${fullNameError ? styles.floatingLabelError : ''}`}
                >
                  Full name
                </label>
              </div>
              {fullNameError && (
                <div className={styles.errorMessage}>
                  {fullNameError}
                </div>
              )}
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
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isFormLoading}
              className={styles.continueButton}
            >
              {isFormLoading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TellUsAboutYou;
