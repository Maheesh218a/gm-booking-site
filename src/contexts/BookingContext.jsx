import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { collection, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    
    // If it's a demo user, only fetch once so their local additions don't get overwritten by live sync
    if (user?.role === 'demo') {
      getDocs(bookingsRef).then((snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingsData);
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching demo bookings:", error);
        setLoading(false);
      });
      return; // Return empty cleanup function since there's no listener
    }

    // Set up real-time listener for real owners
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
  }, [user]); // Re-run if user changes

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

    const newBooking = {
      ...bookingData,
      createdAt: new Date().toISOString(),
    };

    if (user?.role === 'demo') {
      // Local save only for demo mode
      newBooking.id = 'demo-' + Date.now();
      setBookings(prev => [...prev, newBooking]);
      Swal.fire({ icon: 'info', title: 'Demo Mode', text: 'Saved locally (Not synced to cloud)', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, background: '#151C2C', color: '#60A5FA' });
      return true;
    }

    try {
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

    if (user?.role === 'demo') {
      // Local save only for demo mode
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatedData } : b));
      Swal.fire({ icon: 'info', title: 'Demo Mode', text: 'Updated locally (Not synced to cloud)', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, background: '#151C2C', color: '#60A5FA' });
      return true;
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
    if (user?.role === 'demo') {
      // Local delete only for demo mode
      setBookings(prev => prev.filter(b => b.id !== id));
      Swal.fire({ icon: 'info', title: 'Demo Mode', text: 'Deleted locally (Not synced to cloud)', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, background: '#151C2C', color: '#60A5FA' });
      return true;
    }

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
