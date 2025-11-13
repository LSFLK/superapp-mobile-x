import { ReceivedMemo } from './types';
import { isMemoExpired } from './lib/memoExpiry';
import { jwtDecode } from 'jwt-decode';

const MEMOS_STORAGE_KEY = 'memo-app:received-memos';

/**
 * JWT token claims interface
 * Supports standard OIDC/OAuth2 claims
 */
interface JWTClaims {
  email?: string;
  preferred_username?: string;
  sub?: string;
}

const Bridge = {
  /**
   * Get authentication token from the native app
   * Decodes JWT to extract user email and ID from token claims
   * 
   * @returns Object containing token, email, and userId
   * @throws Error if bridge is not available or token is missing
   */
  getToken: async () => {
    if (window.nativebridge?.requestToken) {
      const token = await window.nativebridge.requestToken();
      
      if (!token) {
        throw new Error('No token received from bridge');
      }

      // Decode JWT to extract email and userId from token claims
      try {
        const claims = jwtDecode<JWTClaims>(token);
        
        return {
          token: token,
          email: claims.email || claims.preferred_username || claims.sub || '',
        };
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
        // Return token without decoded claims if decoding fails
        return {
          token: token,
          email: '',
        };
      }
    }
    throw new Error('Bridge not available - must be run within the mobile app');
  },
  

  saveMemo: async (memo: ReceivedMemo) => {
    if (window.nativebridge?.requestSaveLocalData) {

      const existing = await bridge.getSavedMemos();
      const updated = [...existing, memo];
      
      await window.nativebridge.requestSaveLocalData({
        key: MEMOS_STORAGE_KEY,
        value: JSON.stringify(updated),
      });
      return;
    }
    throw new Error('Bridge not available - must be run within the mobile app');
  },
  

  getSavedMemos: async (): Promise<ReceivedMemo[]> => {
    if (window.nativebridge?.requestGetLocalData) {
      const result = await window.nativebridge.requestGetLocalData({
        key: MEMOS_STORAGE_KEY,
      });
      
      if (result.value) {
        try {
          const parsed: ReceivedMemo[] = JSON.parse(result.value);

          // Filter out expired memos. If any were expired, persist the cleaned list.
          const valid = parsed.filter(m => !isMemoExpired(m));
          if (valid.length !== parsed.length && window.nativebridge.requestSaveLocalData) {
            try {
              await window.nativebridge.requestSaveLocalData({
                key: MEMOS_STORAGE_KEY,
                value: JSON.stringify(valid),
              });
            } catch (e) {
              // Best-effort: if saving fails, continue and return the filtered list
              console.warn('Failed to persist cleaned memos after expiry filter:', e);
            }
          }

          return valid;
        } catch (error) {
          console.error('Failed to parse saved memos:', error);
          return [];
        }
      }
      return [];
    }
    throw new Error('Bridge not available - must be run within the mobile app');
  },
  
  /**
   * Delete a memo from local storage
   * Uses AsyncStorage through the bridge
   */
  deleteMemo: async (id: string) => {
    if (window.nativebridge?.requestSaveLocalData) {
      const existing = await bridge.getSavedMemos();
      const updated = existing.filter(memo => memo.id !== id);
      
      await window.nativebridge.requestSaveLocalData({
        key: MEMOS_STORAGE_KEY,
        value: JSON.stringify(updated),
      });
      return;
    }
    throw new Error('Bridge not available - must be run within the mobile app');
  },


  showAlert: async (title: string, message: string) => {
    if (window.nativebridge?.requestAlert) {
      return await window.nativebridge.requestAlert({
        title,
        message,
        buttonText: 'OK',
      });
    }
    // Fallback to browser alert if bridge not available
    alert(`${title}\n\n${message}`);
  },
};

export const bridge = Bridge;


