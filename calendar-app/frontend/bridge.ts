// Bridge for microapp integration
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    nativebridge?: {
      requestGetLocalData: (params: { key: string }) => Promise<{ value: string | null }>;
      requestSaveLocalData: (params: { key: string; value: string }) => Promise<void>;
    };
  }
}

export const bridge = {
  /**
   * Get data from local storage
   * Uses AsyncStorage through the native bridge, falls back to localStorage for browser testing
   */
  async getLocalData<T>(key: string, defaultValue: T): Promise<T> {
    if (window.nativebridge?.requestGetLocalData) {
      try {
        const result = await window.nativebridge.requestGetLocalData({ key });

        if (result.value) {
          try {
            return JSON.parse(result.value);
          } catch (error) {
            console.error('Failed to parse stored data:', error);
            return defaultValue;
          }
        }
        return defaultValue;
      } catch (error) {
        console.error('Failed to get data from native bridge:', error);
        return defaultValue;
      }
    }

    // Fallback to localStorage for browser testing
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Save data to local storage
   * Uses AsyncStorage through the native bridge, falls back to localStorage for browser testing
   */
  async saveLocalData<T>(key: string, value: T): Promise<void> {
    if (window.nativebridge?.requestSaveLocalData) {
      try {
        await window.nativebridge.requestSaveLocalData({
          key,
          value: JSON.stringify(value),
        });
        return;
      } catch (error) {
        console.error('Failed to save data via native bridge:', error);
        throw error;
      }
    }

    // Fallback to localStorage for browser testing
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save local data:', error);
      throw error;
    }
  },

  isWebView(): boolean {
    return !!window.ReactNativeWebView;
  },
};
