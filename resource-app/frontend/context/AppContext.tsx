import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Booking, ApiResponse, BookingStatus } from '../types';
import { client as api } from '../api/client';

interface AppContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  createBooking: (data: Record<string, unknown>) => Promise<ApiResponse<Booking>>;
  cancelBooking: (id: string) => Promise<void>;
  dismissBooking: (id: string) => Promise<void>;
  processBooking: (id: string, status: BookingStatus, reason?: string) => Promise<void>;
  rescheduleBooking: (id: string, start: string, end: string) => Promise<ApiResponse<Booking>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const bookRes = await api.getBookings();
      if (bookRes.success && bookRes.data) setBookings(bookRes.data);
    } catch (err: unknown) {
      console.error('Failed to load data', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createBooking = useCallback(async (data: Record<string, unknown>) => {
    const res = await api.createBooking(data);
    if (res.success) await fetchData();
    return res;
  }, [fetchData]);

  const cancelBooking = useCallback(async (id: string) => {
    await api.cancelBooking(id);
    await fetchData();
  }, [fetchData]);

  const dismissBooking = useCallback(async (id: string) => {
    await api.cancelBooking(id);
    await fetchData();
  }, [fetchData]);

  const processBooking = useCallback(async (id: string, status: BookingStatus, reason?: string) => {
    await api.processBooking(id, status, reason);
    await fetchData();
  }, [fetchData]);

  const rescheduleBooking = useCallback(async (id: string, start: string, end: string) => {
    const res = await api.rescheduleBooking(id, start, end);
    if (res.success) await fetchData();
    return res;
  }, [fetchData]);

  return (
    <AppContext.Provider value={{
      bookings,
      isLoading,
      error,
      refreshData: fetchData,
      createBooking,
      cancelBooking,
      dismissBooking,
      processBooking,
      rescheduleBooking,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
