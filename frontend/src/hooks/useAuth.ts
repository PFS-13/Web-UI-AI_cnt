import { useState, useEffect, useCallback } from 'react';
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authAPI } from '../services/api';
import { tokenStorage } from '../services/storage';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = tokenStorage.getToken();
        const user = tokenStorage.getUser();
        
        if (token && user) {
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication',
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // For now, we'll use Google OAuth
      // In the future, implement local login
      const googleUrl = authAPI.getGoogleAuthUrl(credentials.email);
      window.location.href = googleUrl;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authAPI.register(credentials);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return response;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (userId: string, otp: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authAPI.verifyOtp({ user_id: userId, otp });
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return response;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'OTP verification failed',
      }));
      throw error;
    }
  }, []);

  const setUser = useCallback((user: User, token: string) => {
    tokenStorage.setUser(user);
    tokenStorage.setToken(token);
    
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    verifyOtp,
    setUser,
    logout,
    clearError,
  };
};
