import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import styles from './AuthCallback.module.css';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

 useEffect(() => {
  const handleCallback = async () => {
    try {
      // Cek cookie Authentication dengan memanggil endpoint protected
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/auth/v1/me`, {
        credentials: 'include', 
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Login successful! Redirecting...');
        // Redirect ke dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Authentication cookie not found or invalid');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      // Redirect ke halaman login setelah 3 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  handleCallback();
}, [searchParams, setUser, navigate]);
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner}></div>
            <h2>Authenticating...</h2>
            <p>Please wait while we complete your login.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2>Success!</h2>
            <p>{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✗</div>
            <h2>Error</h2>
            <p>{message}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.href = '/'}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
