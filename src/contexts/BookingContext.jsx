import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(bookingsRef, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      Swal.fire('Error', 'Failed to connect to database.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkConflict = (vehicle, startDate, endDate, newBookingId = null) => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    return bookings.some(b => {
      if (newBookingId && b.id === newBookingId) return false;
      if (b.vehicle !== vehicle) return false;
      
      const bStart = new Date(b.startDate || b.date);
      const bEnd = new Date(b.endDate || b.date);
      
      return (newStart <= bEnd && newEnd >= bStart);
    });
  };

  const addBooking = async (bookingData) => {
    if (checkConflict(bookingData.vehicle, bookingData.startDate || bookingData.date, bookingData.endDate || bookingData.date)) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'This vehicle is already booked for these dates.',
        background: '#151C2C',
        color: '#F3F4F6',
      });
      return false;
    }

    try {
      const newBooking = {
        ...bookingData,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'bookings'), newBooking);
      return true;
    } catch (error) {
      console.error("Error adding booking: ", error);
      Swal.fire('Error', 'Failed to add booking.', 'error');
      return false;
    }
  };

  const updateBooking = async (id, updatedData) => {
    if (checkConflict(updatedData.vehicle, updatedData.startDate || updatedData.date, updatedData.endDate || updatedData.date, id)) {
      Swal.fire({
        icon: 'error',
        title: 'Conflict Detected',
        text: 'This vehicle is already booked for these dates.',
        background: '#151C2C',
        color: '#F3F4F6',
      });
      return false;
    }

    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, updatedData);
      return true;
    } catch (error) {
      console.error("Error updating booking: ", error);
      Swal.fire('Error', 'Failed to update booking.', 'error');
      return false;
    }
  };

  const deleteBooking = async (id) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      return true;
    } catch (error) {
      console.error("Error deleting booking: ", error);
      Swal.fire('Error', 'Failed to delete booking.', 'error');
      return false;
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBooking, deleteBooking, loading }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => useContext(BookingContext);
