import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useBookings } from '../contexts/BookingContext';
import BookingModal from '../components/BookingModal';
import BookingDetailsModal from '../components/BookingDetailsModal';
import Swal from 'sweetalert2';
import { Plus } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const { bookings, addBooking, updateBooking, deleteBooking } = useBookings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  const events = useMemo(() => {
    return bookings.map(b => {
      // Parse the date and time to create a Date object for the calendar
      const [year, month, day] = b.date.split('-');
      const [hours, minutes] = b.time.split(':');
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(year, month - 1, day, parseInt(hours) + 2, minutes); // Assuming 2 hours default duration for visualization

      return {
        id: b.id,
        title: `${b.vehicle} - ${b.customerName || b.customerPhone}`,
        start,
        end,
        resource: b,
      };
    });
  }, [bookings]);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setModalMode('add');
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedBooking(event.resource);
    setIsDetailsOpen(true);
  };

  const handleSaveBooking = (data, id) => {
    let success = false;
    if (modalMode === 'add') {
      success = addBooking(data);
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Added',
          text: 'The booking was successfully created.',
          background: '#151C2C',
          color: '#F3F4F6',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      }
    } else {
      success = updateBooking(id, data);
      if (success) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Updated',
          text: 'The booking details were successfully updated.',
          background: '#151C2C',
          color: '#F3F4F6',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
        // Update details view if it was open from edit
        setSelectedBooking({ ...selectedBooking, ...data });
      }
    }
    return success;
  };

  const handleDeleteBooking = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it!',
      background: '#151C2C',
      color: '#F3F4F6',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBooking(id);
        setIsDetailsOpen(false);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The booking has been deleted.',
          background: '#151C2C',
          color: '#F3F4F6',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const openEditModal = (booking) => {
    setIsDetailsOpen(false);
    setSelectedBooking(booking);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3B82F6'; // Default primary
    if (event.resource.vehicle === 'NB 8087') backgroundColor = '#3B82F6'; // Blue
    if (event.resource.vehicle === 'NC 7573') backgroundColor = '#10B981'; // Green
    if (event.resource.vehicle === 'KX 2422') backgroundColor = '#8B5CF6'; // Purple

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Booking Calendar</h2>
          <p className="text-sm text-textMuted mt-1">Manage your fleet schedule</p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setModalMode('add');
            setSelectedBooking(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Add Booking</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex space-x-4 mb-2 text-sm text-textMuted">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>NB 8087</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          <span>NC 7573</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>KX 2422</span>
        </div>
      </div>

      <div className="flex-1 glass-card p-4 min-h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
        />
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
        initialData={modalMode === 'edit' ? selectedBooking : null}
        selectedDate={selectedDate}
      />

      <BookingDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        booking={selectedBooking}
        onEdit={openEditModal}
        onDelete={handleDeleteBooking}
      />
    </div>
  );
};

export default CalendarView;
