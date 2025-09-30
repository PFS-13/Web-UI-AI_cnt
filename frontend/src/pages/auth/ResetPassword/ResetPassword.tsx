import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import styles from '../styles/Auth.module.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const email = 'polbanmlbbcommunity@gmail.com'; // Hardcoded for testing

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call untuk reset password
      console.log(`Reset password request for: ${email}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Redirect ke login setelah berhasil
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
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
          <h1 className={styles.title}>Reset password</h1>
          <p className={styles.subtitle}>
            Click "Continue" to reset your password for{' '}
            <span className={styles.emailText}>{email}</span>
          </p>

          <form onSubmit={handleContinue} className={styles.form}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              className={styles.continueButton}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Continue'}
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

export default ResetPassword;
