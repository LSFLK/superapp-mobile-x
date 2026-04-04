export {};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    nativebridge?: {
      // token is supplied by the host app (native layer)
      requestToken: () => Promise<string>;

      // ask the host to download a file (either via URL or base64 payload)
      requestDownloadFile: (options: {
        url?: string;
        filename?: string;
        base64?: string;
      }) => Promise<void>;

      requestGetLocalData: (params: {
        key: string;
      }) => Promise<{ value: string | null }>;
      requestSaveLocalData: (params: {
        key: string;
        value: string;
      }) => Promise<void>;
    };
  }
}
