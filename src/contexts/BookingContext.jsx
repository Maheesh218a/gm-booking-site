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

  const checkConflict = (vehicle, startDate, endDate, newBookingId = null) => {
    // Check if the new date range overlaps with any existing booking for the same vehicle
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    return bookings.some(b => {
      if (newBookingId && b.id === newBookingId) return false;
      if (b.vehicle !== vehicle) return false;
      
      const bStart = new Date(b.startDate || b.date);
      const bEnd = new Date(b.endDate || b.date);
      
      // Two ranges overlap if: start1 <= end2 AND end1 >= start2
      return (newStart <= bEnd && newEnd >= bStart);
    });
  };

  const addBooking = (bookingData) => {
    if (checkConflict(bookingData.vehicle, bookingData.startDate || bookingData.date, bookingData.endDate || bookingData.date)) {
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
    if (checkConflict(updatedData.vehicle, updatedData.startDate || updatedData.date, updatedData.endDate || updatedData.date, id)) {
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
