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
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('No authentication token received');
          return;
        }

        // Store the token
        sessionStorage.setItem('auth_token', token);
        
        // For now, we'll create a mock user object
        // In a real app, you'd decode the JWT or fetch user data
        const mockUser = {
          id: 'user-id',
          email: 'user@example.com',
          username: 'User',
          is_active: true,
          provider: 'google' as const,
        };

        setUser(mockUser, token);
        setStatus('success');
        setMessage('Login successful! Redirecting...');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
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
