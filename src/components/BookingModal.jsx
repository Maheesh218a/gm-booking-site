import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const bookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  startLocation: z.string().min(1, 'Start location is required'),
  route: z.string().min(1, 'Route is required'),
  destination: z.string().min(1, 'Destination is required'),
  customerPhone: z.string().regex(/^(?:0|94|\+94)?(?:7[0-9]{8}|[1-9][0-9]{8})$/, 'Invalid Sri Lankan phone number'),
  customerName: z.string().optional(),
  vehicle: z.enum(['NB 8087', 'NC 7573', 'KX 2422'], { errorMap: () => ({ message: 'Vehicle is required' }) }),
  totalAmount: z.coerce.number().min(1, 'Total amount must be greater than 0'),
  advanceAmount: z.coerce.number().min(0, 'Advance amount cannot be negative'),
  fuelPricePerLiter: z.coerce.number().min(0, 'Fuel price cannot be negative'),
  kilometers: z.coerce.number().min(1, 'Kilometers must be greater than 0'),
  status: z.enum(['Confirmed', 'Not Confirmed']),
  notes: z.string().optional(),
}).refine(data => data.advanceAmount <= data.totalAmount, {
  message: "Advance amount cannot exceed total amount",
  path: ["advanceAmount"],
});

const BookingModal = ({ isOpen, onClose, onSave, initialData, selectedDate }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '',
      advanceAmount: '',
      fuelPricePerLiter: '',
      totalAmount: '',
      kilometers: '',
      status: 'Confirmed',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          date: selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '',
          advanceAmount: '',
          fuelPricePerLiter: '',
          totalAmount: '',
          kilometers: '',
          status: 'Confirmed',
        });
      }
    }
  }, [isOpen, initialData, selectedDate, reset]);

  const onSubmit = (data) => {
    const success = onSave(data, initialData?.id);
    if (success) onClose();
  };

  const total = watch('totalAmount') || 0;
  const advance = watch('advanceAmount') || 0;
  const balance = total - advance;

  const preventNegative = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleNumberBlur = (fieldName) => (e) => {
    register(fieldName).onBlur(e); // Let React Hook Form handle its blur event
    if (e.target.value !== '') {
      const formatted = parseFloat(e.target.value).toFixed(2);
      setValue(fieldName, formatted, { shouldValidate: true });
    }
  };

  if (!isOpen) return null;

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
          className="relative glass border border-border bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-10"
        >
          <div className="sticky top-0 glass-card rounded-b-none border-b border-border p-4 flex justify-between items-center bg-surface/90">
            <h2 className="text-xl font-bold text-text">
              {initialData ? 'Edit Booking' : 'Add New Booking'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-border rounded-full text-textMuted hover:text-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Date *</label>
                <input type="date" {...register('date')} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Departure Time *</label>
                <input type="time" {...register('time')} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.time && <p className="text-danger text-xs mt-1">{errors.time.message}</p>}
              </div>

              {/* Vehicle & Status */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Vehicle *</label>
                <select {...register('vehicle')} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select Vehicle</option>
                  <option value="NB 8087">NB 8087 (Bus)</option>
                  <option value="NC 7573">NC 7573 (Bus)</option>
                  <option value="KX 2422">KX 2422 (Car)</option>
                </select>
                {errors.vehicle && <p className="text-danger text-xs mt-1">{errors.vehicle.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Booking Status *</label>
                <select {...register('status')} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none">
                  <option value="Confirmed">Confirmed</option>
                  <option value="Not Confirmed">Not Confirmed</option>
                </select>
                {errors.status && <p className="text-danger text-xs mt-1">{errors.status.message}</p>}
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Customer Phone *</label>
                <input type="tel" {...register('customerPhone')} placeholder="077xxxxxxx" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.customerPhone && <p className="text-danger text-xs mt-1">{errors.customerPhone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Customer Name (Optional)</label>
                <input type="text" {...register('customerName')} placeholder="John Doe" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
              </div>

              {/* Route */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Start Location *</label>
                <input type="text" {...register('startLocation')} placeholder="Matale" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.startLocation && <p className="text-danger text-xs mt-1">{errors.startLocation.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Destination *</label>
                <input type="text" {...register('destination')} placeholder="Colombo" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.destination && <p className="text-danger text-xs mt-1">{errors.destination.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-textMuted mb-1">Route *</label>
                <input type="text" {...register('route')} placeholder="Via Kandy" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" />
                {errors.route && <p className="text-danger text-xs mt-1">{errors.route.message}</p>}
              </div>

              {/* Financials & Distance */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Total Amount (Rs) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  onKeyDown={preventNegative}
                  {...register('totalAmount')} 
                  onBlur={handleNumberBlur('totalAmount')}
                  className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" 
                />
                {errors.totalAmount && <p className="text-danger text-xs mt-1">{errors.totalAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Advance Amount (Rs)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  onKeyDown={preventNegative}
                  {...register('advanceAmount')} 
                  onBlur={handleNumberBlur('advanceAmount')}
                  className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" 
                />
                {errors.advanceAmount && <p className="text-danger text-xs mt-1">{errors.advanceAmount.message}</p>}
              </div>
              
              <div className="md:col-span-2 bg-background/50 p-4 rounded-lg border border-border flex justify-between items-center">
                <span className="text-sm font-medium text-textMuted">Balance to Collect:</span>
                <span className="text-lg font-bold text-primary">Rs. {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Diesel/Petrol Price per Liter (Rs)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  onKeyDown={preventNegative}
                  {...register('fuelPricePerLiter')} 
                  onBlur={handleNumberBlur('fuelPricePerLiter')}
                  className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" 
                />
                {errors.fuelPricePerLiter && <p className="text-danger text-xs mt-1">{errors.fuelPricePerLiter.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Total Kilometers *</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  onKeyDown={preventNegative}
                  {...register('kilometers')} 
                  onBlur={handleNumberBlur('kilometers')}
                  className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none" 
                />
                {errors.kilometers && <p className="text-danger text-xs mt-1">{errors.kilometers.message}</p>}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-textMuted mb-1">Notes (Optional)</label>
                <textarea {...register('notes')} rows="3" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-surface text-text hover:bg-border transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primaryDark transition-colors">
                {isSubmitting ? 'Saving...' : 'Save Booking'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
