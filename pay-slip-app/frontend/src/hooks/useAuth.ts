import { useState, useEffect } from 'react';
import { User } from '../types';
import { useBridge } from './useBridge';
import { api } from '../api/client';

export const useAuth = () => {
  const { token, isReady } = useBridge();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !token) return;

    const fetchUser = async () => {
      try {
        const userData = await api.getMe(token);
        setUser(userData);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load user profile';
        setError(errorMsg);
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, isReady]);

  return {
    user,
    token,
    isAdmin: user?.role === 'admin',
    loading: loading || !isReady,
    error,
  };
};
