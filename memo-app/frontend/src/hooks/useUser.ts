import { useState, useEffect } from 'react';
import { bridge } from '../bridge';

/**
 * Custom hook for getting user information from the native bridge
 */
export const useUser = () => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const tokenData = await bridge.getToken();
      setUserEmail(tokenData.email);
    } catch (error) {
      console.error('Failed to get user info:', error);
      await bridge.showAlert('Error', 'Failed to load user information. Please restart the app.');
    } finally {
      setLoading(false);
    }
  };

  return { userEmail, loading };
};
