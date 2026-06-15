import { createContext, useContext, useState, type ReactNode } from 'react';
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
  // Reservas
  bookings: Booking[];
  addBooking: (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  // Flujo de reserva (modal)
  bookingVenue: Venue | null;
  openBooking: (venue: Venue) => void;
  closeBooking: () => void;
  // Detalle de venue (modal)
  detailVenue: Venue | null;
  openDetail: (venue: Venue) => void;
  closeDetail: () => void;
  // Likes globales
  likedIds: Record<string, boolean>;
  toggleLike: (venueId: string) => void;
}

const BookingsContext = createContext<BookingsContextType | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [detailVenue, setDetailVenue] = useState<Venue | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

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

  const toggleLike = (venueId: string) =>
    setLikedIds(prev => ({ ...prev, [venueId]: !prev[venueId] }));

  return (
    <BookingsContext.Provider value={{
      bookings,
      addBooking,
      cancelBooking,
      bookingVenue,
      openBooking: setBookingVenue,
      closeBooking: () => setBookingVenue(null),
      detailVenue,
      openDetail: setDetailVenue,
      closeDetail: () => setDetailVenue(null),
      likedIds,
      toggleLike,
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
