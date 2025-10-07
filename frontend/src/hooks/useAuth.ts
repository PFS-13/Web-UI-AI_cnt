import { useState, useEffect } from 'react';
import { authAPI } from '../services';

interface User {
  id: string;
  username?: string;
  email: string;
  is_active: boolean;
  image_url?: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refetch = async () => {
    await checkAuth();
  };

  const logout = () => {
    setUser(null);
    setError(null);
    // Clear any stored tokens
    localStorage.removeItem('token');
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    error,
    refetch,
    logout,
    isLoading: loading,
    clearError,
  };
};