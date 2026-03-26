import axios from 'axios';
import { bridge } from '../infrastructure/bridge';
import { APP_CONFIG } from '../infrastructure/config';

const API_URL = APP_CONFIG.API_BASE_URL;

const httpClient = axios.create({
    baseURL: API_URL,
});

export { httpClient };

// Token management
let activeToken: string | null = null;
let isRefreshing = false;

// Request interceptor to inject auth token
httpClient.interceptors.request.use(async (config) => {
    // If we don't have a token, get one
    if (!activeToken) {
        try {
            const tokenData = await bridge.getToken();
            if (tokenData.token) {
                activeToken = tokenData.token;
            }
        } catch (error) {
            console.error('Failed to get initial token:', error);
        }
    }

    if (activeToken) {
        config.headers['Authorization'] = `Bearer ${activeToken}`;
    } else {
        // If still no token, try one last time with retries
        const maxRetries = 3;
        let retries = 0;
        while (retries < maxRetries && !activeToken) {
            try {
                const tokenData = await bridge.getToken();
                if (tokenData.token) {
                    activeToken = tokenData.token;
                    config.headers['Authorization'] = `Bearer ${activeToken}`;
                    return config;
                }
            } catch (err) { 
                console.warn(`Token retrieval retry ${retries + 1} failed:`, err);
                retries++; 
                await new Promise(r => setTimeout(r, 500)); 
            }
        }
        if (!activeToken) {
            throw new Error('Authentication token not available');
        }
    }
    return config;
});

// Response interceptor to handle 401s and errors
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                try {
                    await new Promise((resolve, reject) => {
                        const interval = setInterval(() => {
                            if (!isRefreshing) {
                                clearInterval(interval);
                                if (activeToken) resolve(activeToken);
                                else reject(new Error('Token refresh failed'));
                            }
                        }, 100);
                    });
                    originalRequest.headers['Authorization'] = `Bearer ${activeToken}`;
                    return httpClient(originalRequest);
                } catch {
                    return Promise.reject(error);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const tokenData = await bridge.getToken();
                if (tokenData.token) {
                    activeToken = tokenData.token;
                    originalRequest.headers['Authorization'] = `Bearer ${activeToken}`;
                    isRefreshing = false;
                    return httpClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
            }
            isRefreshing = false;
        }

        console.error('API Error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Network request failed';
        return Promise.reject(new Error(errorMessage));
    }
);
