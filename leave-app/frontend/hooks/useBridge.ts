import { useState, useEffect, useCallback } from "react";

interface BridgeState {
  token: string | null;
  isReady: boolean;
}

export const useBridge = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const inHost =
    typeof (window as any).nativebridge?.requestToken === "function";

  useEffect(() => {
    const run = async () => {
      // Use env-based default dev token when not running in a host environment.
      const defaultDevToken =
        (import.meta as any).env?.VITE_DEV_TOKEN || "dev-token-123";
      if (!inHost) {
        console.warn("Bridge not found. Using dev token.");
        setToken(defaultDevToken);
        setIsReady(true);
        return;
      }

      // Retry logic for token fetching
      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const fetchedToken = await (window as any).nativebridge.requestToken();
          if (fetchedToken && fetchedToken.trim() !== '') {
            setToken(fetchedToken);
            setIsReady(true);
            return;
          }

          // Token is null/empty, retry
          console.warn(`Token not available, retrying... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        } catch (e) {
          console.error("requestToken failed", e);
          retries++;

          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // If we get here, we couldn't get a valid token after retries
      console.error("Failed to obtain token after retries, falling back to dev token");
      setToken(defaultDevToken);
      setIsReady(true);
    };
    run();
  }, [inHost]);

  const requestToken = useCallback(async () => {
    if (inHost) {
      return (window as any).nativebridge.requestToken();
    }
    return "dev-token-123";
  }, [inHost]);

  const requestDownloadFile = useCallback(
    async (options: { url?: string; filename?: string; base64?: string }) => {
      if (inHost) {
        return (window as any).nativebridge.requestDownloadFile(options);
      }
    },
    [inHost]
  );

  return { token, isReady, requestToken, requestDownloadFile };
};
