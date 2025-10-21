import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { AuthHeader } from '../../../components/layout';
import styles from '../styles/Auth.module.css';
import { authAPI } from '../../../services';
import { TokenType } from '../../../types';
const Verification: React.FC = () => {
  const [code, setCode] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [email, setEmail] = useState('');
  const [verifyType, setVerifyType] = useState<TokenType>('auth'); // 'auth' atau 'reset_password'
  const codeInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const email = location.state.email || {};
    if (email) {
      setEmail(email);
    } else {
      navigate('/login')
    }
    const purpose = location.state.purpose || 'auth';
    setVerifyType(purpose);
  }, []);

  // Auto focus ketika error muncul
  useEffect(() => {
    if (codeError && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [codeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    // Validasi code kosong
    if (!code.trim()) {
      setCodeError('Verification code is required.');
      return;
    }

    // Validasi panjang code harus tepat 6 karakter
    if (code.length !== 6) {
      setCodeError('Verification code must be exactly 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const user = await authAPI.verifyOtp({email, code, token_type: verifyType});
      if (verifyType === 'forgot_password') {
        navigate('/new-password', { state: { user_id: user.user_id } });
        return;
      } else {
        navigate('/tell-us-about-you');
      }
    } catch (err : unknown) {
      setCodeError((err as Error).message || 'Failed to verify code. Please try again.');
    } finally{
      setIsLoading(false)
    }
  };

  const handleResendEmail = async () => {
    try {
      await authAPI.resendEmail(email, verifyType);
    } catch (err: unknown) { 
      console.error((err as Error).message);
    } finally {
    }
  };


  
  
  return (
    <div className={styles.container}>
      <AuthHeader />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h1 className={styles.title}>Check your inbox</h1>
          <p className={styles.subtitle}>
            Enter the verification code we just sent to <strong>{email}</strong>.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.floatingLabelContainer}>
                  <input
                    ref={codeInputRef}
                    id="code"
                    type="text"
                    value={code}
                    maxLength={6}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Hanya allow angka, maksimal 6 karakter
                      const filteredValue = value.replace(/[^0-9]/g, '').slice(0, 6);
                      setCode(filteredValue);
                      if (codeError) setCodeError('');
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`${styles.formInput} ${codeError ? styles.formInputError : ''}`}
                    placeholder=""
                  />
                <label
                  htmlFor="code"
                  className={`${styles.floatingLabel} ${(isFocused || code) ? styles.floatingLabelActive : ''} ${isFocused ? styles.focused : ''} ${codeError ? styles.floatingLabelError : ''}`}
                >
                  Code
                </label>
              </div>
              {codeError && (
                <div className={styles.errorMessage}>
                  {codeError}
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
              {isLoading ? 'Verifying...' : 'Continue'}
            </Button>

            <div className={styles.resendContainer}>
              <button
                type="button"
                onClick={handleResendEmail}
                className={styles.resendButton}
              >
                Resend email
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

export default Verification;
