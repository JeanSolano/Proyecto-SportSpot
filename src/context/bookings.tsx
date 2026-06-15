import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Venue } from '@/app/index';

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  sport: string;
  sportColor: string;
  imageUrl: string;
  location: string;
  dateKey: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricePerHour: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

interface BookingsContextType {
  bookings: Booking[];
  bookingVenue: Venue | null;
  addBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  openBooking: (venue: Venue) => void;
  closeBooking: () => void;
}

const BookingsContext = createContext<BookingsContextType | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);

  const addBooking = (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    setBookings(prev => [{
      ...data,
      id: `b-${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const cancelBooking = (id: string) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));

  return (
    <BookingsContext.Provider value={{
      bookings,
      bookingVenue,
      addBooking,
      cancelBooking,
      openBooking: setBookingVenue,
      closeBooking: () => setBookingVenue(null),
    }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
