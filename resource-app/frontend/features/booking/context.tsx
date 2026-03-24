import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Booking, BookingStatus } from './types';
import { bookingApi } from './api';
import { ApiResponse } from '../../api/types';

interface BookingContextType {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  createBooking: (data: Record<string, unknown>) => Promise<ApiResponse<Booking>>;
  cancelBooking: (id: string) => Promise<void>;
  dismissBooking: (id: string) => Promise<void>;
  processBooking: (id: string, status: BookingStatus, reason?: string) => Promise<void>;
  rescheduleBooking: (id: string, start: string, end: string) => Promise<ApiResponse<void>>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setError(null);
    try {
      const res = await bookingApi.getBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setError(res.error || 'Failed to fetch bookings');
      }
    } catch (err: unknown) {
      console.error('BookingProvider error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (data: Record<string, unknown>) => {
    const res = await bookingApi.createBooking(data);
    if (res.success) await fetchBookings();
    return res as ApiResponse<Booking>;
  }, [fetchBookings]);

  const cancelBooking = useCallback(async (id: string) => {
    await bookingApi.cancelBooking(id);
    await fetchBookings();
  }, [fetchBookings]);

  const dismissBooking = useCallback(async (id: string) => {
    // Dismissing a rejection or proposal effectively cancels it
    await bookingApi.cancelBooking(id);
    await fetchBookings();
  }, [fetchBookings]);

  const processBooking = useCallback(async (id: string, status: BookingStatus, reason?: string) => {
    await bookingApi.processBooking(id, status, reason);
    await fetchBookings();
  }, [fetchBookings]);

  const rescheduleBooking = useCallback(async (id: string, start: string, end: string): Promise<ApiResponse<void>> => {
    const res = await bookingApi.rescheduleBooking(id, start, end);
    if (res.success) await fetchBookings();
    return res;
  }, [fetchBookings]);

  return (
    <BookingContext.Provider value={{
      bookings,
      isLoading,
      error,
      refreshBookings: fetchBookings,
      createBooking,
      cancelBooking,
      dismissBooking,
      processBooking,
      rescheduleBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};
