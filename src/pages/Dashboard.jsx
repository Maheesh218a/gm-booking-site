import React from 'react';
import { useBookings } from '../contexts/BookingContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';

const Dashboard = () => {
  const { bookings } = useBookings();

  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');

  const totalBookings = confirmedBookings.length;
  const upcomingTrips = confirmedBookings.filter(b => isFuture(new Date(b.date))).length;
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalAdvances = confirmedBookings.reduce((sum, b) => sum + (Number(b.advanceAmount) || 0), 0);
  
  const todayBookings = confirmedBookings.filter(b => isToday(new Date(b.date)));

  const statCards = [
    { title: 'Total Bookings', value: totalBookings, icon: Calendar, color: 'text-primary' },
    { title: 'Upcoming Trips', value: upcomingTrips, icon: TrendingUp, color: 'text-secondary' },
    { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Total Advances', value: formatCurrency(totalAdvances), icon: Wallet, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-xl bg-surface ${stat.color} border border-border/50`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-textMuted">{stat.title}</p>
              <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-text">Today's Bookings</h3>
        {todayBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center flex flex-col items-center justify-center text-textMuted"
          >
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No bookings for today.</p>
            <p className="text-sm">Enjoy your day or add a new booking!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-5 border-l-4 border-l-primary"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-surface text-primary text-xs rounded-md border border-primary/20 font-medium">
                    {booking.vehicle}
                  </span>
                  <span className="text-sm text-textMuted font-medium">{booking.time}</span>
                </div>
                <h4 className="text-lg font-bold text-text truncate">{booking.customerName || booking.customerPhone}</h4>
                <p className="text-sm text-textMuted truncate mt-1">
                  {booking.startLocation} → {booking.destination}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
