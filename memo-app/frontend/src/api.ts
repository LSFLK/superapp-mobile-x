import axios from 'axios';
import { Memo } from './types';
import { bridge } from './bridge';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://192.168.1.100:8080/api';

const api = axios.create({
  baseURL: API_URL + '/api',
});

api.interceptors.request.use(async (config) => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const tokenData = await bridge.getToken();

      if (tokenData.token) {
        config.headers['Authorization'] = `Bearer ${tokenData.token}`;
        return config;
      }

      // Token is null/undefined, wait and retry
      console.warn(`Token not available, retrying... (${retries + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    } catch (error) {
      console.error('Failed to get authentication token:', error);
      retries++;

      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // If we get here, we couldn't get a valid token after retries
  console.error('Failed to obtain authentication token after retries');
  throw new Error('Authentication token not available');
});

/**
 * Send a new memo to a recipient or broadcast to all users
 */
export const sendMemo = async (
  to: string,
  subject: string,
  message: string,
  isBroadcast: boolean = false,
  ttlDays?: number
) => {
  const response = await api.post('/memos', {
    to: isBroadcast ? 'broadcast' : to,
    subject,
    message,
    isBroadcast,
    ttlDays
  });
  return response.data;
};

/**
 * Retrieve all memos sent by the current user
 */
export const getSentMemos = async (limit?: number, offset?: number) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const response = await api.get<Memo[]>(`/memos/sent?${params.toString()}`);
  return response.data;
};

/**
 * Retrieve all memos received by the current user
 * Includes both direct messages and broadcast messages
 */
export const getReceivedMemos = async (limit?: number, offset?: number) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const response = await api.get<Memo[]>(`/memos/received?${params.toString()}`);
  return response.data;
};

/**
 * Update the delivery status of a memo
 */
export const updateMemoStatus = async (id: string, status: 'sent' | 'delivered') => {
  await api.put(`/memos/${id}/status`, { status });
};

/**
 * Delete a sent memo from the server
 */
export const deleteMemo = async (id: string) => {
  await api.delete(`/memos/${id}`);
};

/**
 * Get list of all active users (email addresses)
 */
export const getUsers = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/users');
  return response.data;
};
