import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Trash2, MapPin, Clock, Phone, Car, FileText, CreditCard } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format, differenceInDays } from 'date-fns';

const BookingDetailsModal = ({ isOpen, onClose, booking, onEdit, onDelete }) => {
  if (!isOpen || !booking) return null;

  const balance = (booking.totalAmount || 0) - (booking.advanceAmount || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass border border-border bg-surface w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl z-10"
        >
          <div className="glass-card rounded-b-none border-b border-border p-4 flex justify-between items-center bg-surface/90">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-text">Booking Details</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                booking.status === 'Confirmed' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {booking.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => onEdit(booking)} className="p-2 hover:bg-primary/20 hover:text-primary rounded-full text-textMuted transition-colors">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => onDelete(booking.id)} className="p-2 hover:bg-danger/20 hover:text-danger rounded-full text-textMuted transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-border rounded-full text-textMuted hover:text-text transition-colors ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-text">{booking.vehicle}</p>
                <p className="text-sm text-textMuted">
                  {booking.startDate === booking.endDate || (!booking.startDate && !booking.endDate)
                    ? `${format(new Date(booking.startDate || booking.date), 'PPPP')} at ${booking.time}` 
                    : `${format(new Date(booking.startDate || booking.date), 'MMM d, yyyy')} - ${format(new Date(booking.endDate || booking.date), 'MMM d, yyyy')} (${differenceInDays(new Date(booking.endDate || booking.date), new Date(booking.startDate || booking.date)) + 1} Days) at ${booking.time}`
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-start space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-textMuted mt-0.5" />
                  <div>
                    <p className="text-textMuted font-medium">Customer</p>
                    <p className="text-text">{booking.customerName || 'N/A'}</p>
                    <p className="text-text">{booking.customerPhone}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-textMuted mt-0.5" />
                  <div>
                    <p className="text-textMuted font-medium">Trip Details</p>
                    <p className="text-text">{booking.startLocation} → {booking.destination}</p>
                    <p className="text-textMuted text-xs mt-0.5">Route: {booking.route} ({booking.kilometers} km)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background/50 rounded-xl p-4 border border-border">
              <div className="flex items-center space-x-2 mb-3">
                <CreditCard className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-text">Financial Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-textMuted">Total Amount</span>
                  <span className="text-text font-medium">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Advance Paid</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(booking.advanceAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/50">
                  <span className="text-text font-medium">Balance</span>
                  <span className="text-primary font-bold text-base">{formatCurrency(balance)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Fuel Price per Liter</span>
                  <span className="text-textMuted">{formatCurrency(booking.fuelPricePerLiter)}</span>
                </div>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-start space-x-3 text-sm bg-surface p-3 rounded-lg border border-border/50">
                <FileText className="w-4 h-4 text-textMuted mt-0.5 shrink-0" />
                <div>
                  <p className="text-textMuted font-medium">Notes</p>
                  <p className="text-text mt-1 whitespace-pre-wrap">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingDetailsModal;
