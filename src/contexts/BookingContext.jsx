import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../lib/utils';
import Swal from 'sweetalert2';

const BookingContext = createContext();

const initialBookings = [];

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gm_bookings');
    if (stored) {
      setBookings(JSON.parse(stored));
    } else {
      setBookings(initialBookings);
    }
    setLoading(false);
  }, []);

  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem('gm_bookings', JSON.stringify(newBookings));
  };

  const checkConflict = (vehicle, date, newBookingId = null) => {
    // Basic date conflict check. A robust system would check time overlaps too.
    // For simplicity, we assume one booking per vehicle per day, or check overlapping times if needed.
    // Let's just check if there's any booking for the exact same vehicle on the same date.
    const bookingDateStr = new Date(date).toISOString().split('T')[0];
    
    return bookings.some(b => {
      if (newBookingId && b.id === newBookingId) return false;
      if (b.vehicle !== vehicle) return false;
      const bDateStr = new Date(b.date).toISOString().split('T')[0];
      return bDateStr === bookingDateStr;
    });
  };

  const addBooking = (bookingData) => {
    if (checkConflict(bookingData.vehicle, bookingData.date)) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'This vehicle is already booked for this date.',
        background: '#151C2C',
        color: '#F3F4F6',
      });
      return false;
    }

    const newBooking = {
      ...bookingData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    saveBookings([...bookings, newBooking]);
    return true;
  };

  const updateBooking = (id, updatedData) => {
    if (checkConflict(updatedData.vehicle, updatedData.date, id)) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'This vehicle is already booked for this date.',
        background: '#151C2C',
        color: '#F3F4F6',
      });
      return false;
    }

    const updated = bookings.map(b => b.id === id ? { ...b, ...updatedData } : b);
    saveBookings(updated);
    return true;
  };

  const deleteBooking = (id) => {
    const updated = bookings.filter(b => b.id !== id);
    saveBookings(updated);
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking, deleteBooking, loading }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => useContext(BookingContext);
