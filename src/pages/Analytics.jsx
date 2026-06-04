import React, { useState, useMemo } from 'react';
import { useBookings } from '../contexts/BookingContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'framer-motion';
import { Search, Filter, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const Analytics = () => {
  const { bookings } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [vehicleFilter, setVehicleFilter] = useState('all');

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Exclude unconfirmed bookings from analytics
      if (b.status === 'Not Confirmed') return false;

      // Search text
      const searchMatch = 
        (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.customerPhone || '').includes(searchTerm) ||
        (b.startLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.destination || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Vehicle filter
      if (vehicleFilter !== 'all' && b.vehicle !== vehicleFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const bDate = new Date(b.date);
        const now = new Date();
        if (dateFilter === 'today') {
          if (!isWithinInterval(bDate, { start: startOfDay(now), end: endOfDay(now) })) return false;
        } else if (dateFilter === 'week') {
          if (!isWithinInterval(bDate, { start: startOfWeek(now), end: endOfWeek(now) })) return false;
        } else if (dateFilter === 'month') {
          if (!isWithinInterval(bDate, { start: startOfMonth(now), end: endOfMonth(now) })) return false;
        }
      }

      return true;
    });
  }, [bookings, searchTerm, dateFilter, vehicleFilter]);

  // Analytics Data Calculation
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalAdvances = filteredBookings.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalDistance = filteredBookings.reduce((sum, b) => sum + (b.kilometers || 0), 0);
  const validFuelPrices = filteredBookings.filter(b => b.fuelPricePerLiter > 0);
  const avgFuelPrice = validFuelPrices.length > 0 
    ? validFuelPrices.reduce((sum, b) => sum + b.fuelPricePerLiter, 0) / validFuelPrices.length 
    : 0;

  // Chart Data: Vehicle Usage
  const vehicleUsageData = [
    { name: 'NB 8087', value: filteredBookings.filter(b => b.vehicle === 'NB 8087').length, color: '#3B82F6' },
    { name: 'NC 7573', value: filteredBookings.filter(b => b.vehicle === 'NC 7573').length, color: '#10B981' },
    { name: 'KX 2422', value: filteredBookings.filter(b => b.vehicle === 'KX 2422').length, color: '#8B5CF6' },
  ].filter(v => v.value > 0);

  // Export to Excel
  const exportToExcel = () => {
    if (filteredBookings.length === 0) return Swal.fire('Oops!', 'No data to export', 'info');
    
    const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      Date: b.date,
      Time: b.time,
      Vehicle: b.vehicle,
      Customer: b.customerName || 'N/A',
      Phone: b.customerPhone,
      Route: `${b.startLocation} to ${b.destination}`,
      TotalAmount: b.totalAmount,
      Advance: b.advanceAmount,
      Balance: b.totalAmount - b.advanceAmount,
      FuelPricePerLiter: b.fuelPricePerLiter,
      KM: b.kilometers
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "GM_Bookings_Report.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (filteredBookings.length === 0) return Swal.fire('Oops!', 'No data to export', 'info');

    const doc = new jsPDF();
    doc.text("GM Super Service - Bookings Report", 14, 15);
    
    const tableColumn = ["Date", "Vehicle", "Customer", "Phone", "Route", "Total", "Balance"];
    const tableRows = [];

    filteredBookings.forEach(b => {
      const balance = b.totalAmount - (b.advanceAmount || 0);
      const bookingData = [
        b.date,
        b.vehicle,
        b.customerName || 'N/A',
        b.customerPhone,
        `${b.startLocation}-${b.destination}`,
        b.totalAmount,
        balance
      ];
      tableRows.push(bookingData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save("GM_Bookings_Report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-text">Search & Analytics</h2>
          <p className="text-sm text-textMuted mt-1">Analyze revenue and find bookings</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={exportToExcel} className="flex items-center space-x-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 px-4 py-2 rounded-lg transition-colors border border-emerald-500/20">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-sm font-medium">Excel</span>
          </button>
          <button onClick={exportToPDF} className="flex items-center space-x-2 bg-rose-600/20 text-rose-500 hover:bg-rose-600/30 px-4 py-2 rounded-lg transition-colors border border-rose-500/20">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none"
            placeholder="Search by name, phone, or location..."
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-textMuted" />
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none appearance-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-textMuted" />
          </div>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:ring-2 focus:ring-primary outline-none appearance-none"
          >
            <option value="all">All Vehicles</option>
            <option value="NB 8087">NB 8087</option>
            <option value="NC 7573">NC 7573</option>
            <option value="KX 2422">KX 2422</option>
          </select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-primary">
          <p className="text-xs text-textMuted font-medium">Total Revenue</p>
          <p className="text-xl font-bold text-text mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-emerald-500">
          <p className="text-xs text-textMuted font-medium">Advances Collected</p>
          <p className="text-xl font-bold text-text mt-1">{formatCurrency(totalAdvances)}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-rose-500">
          <p className="text-xs text-textMuted font-medium">Total Distance</p>
          <p className="text-xl font-bold text-text mt-1">{totalDistance} km</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-amber-500">
          <p className="text-xs text-textMuted font-medium">Avg Fuel Price / L</p>
          <p className="text-xl font-bold text-text mt-1">{formatCurrency(avgFuelPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-1 glass-card p-4 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-text mb-4">Vehicle Usage</h3>
          <div className="flex-1">
            {vehicleUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vehicleUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151C2C', borderColor: '#1F2937', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-textMuted text-sm">No data available</div>
            )}
          </div>
          <div className="flex justify-center space-x-4 mt-2">
            {vehicleUsageData.map((v) => (
              <div key={v.name} className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }}></div>
                <span className="text-textMuted">{v.name} ({v.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-text">Results ({filteredBookings.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-textMuted">
              <thead className="bg-surface/50 text-text text-xs uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center">No bookings found matching filters.</td>
                  </tr>
                ) : (
                  filteredBookings.map(b => {
                    const balance = (b.totalAmount || 0) - (b.advanceAmount || 0);
                    return (
                      <tr key={b.id} className="border-b border-border/30 hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-text whitespace-nowrap">{b.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md text-xs border ${
                            b.vehicle === 'NB 8087' ? 'bg-primary/10 text-primary border-primary/20' :
                            b.vehicle === 'NC 7573' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {b.vehicle}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-text font-medium">{b.customerName || 'Unknown'}</p>
                          <p className="text-xs">{b.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {b.startLocation} → {b.destination}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-text">
                          {formatCurrency(balance)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
