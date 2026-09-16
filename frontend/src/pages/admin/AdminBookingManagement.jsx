import React, { useState, useEffect } from 'react';
import { BookOpen, Search, CheckCircle } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllBookings();
      setBookings(data || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load booking records.");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleMarkComplete = async (bookingId) => {
    if (!window.confirm("Complete this parking session & free the slot?")) return;
    try {
      await adminApi.completeBookingSession(bookingId);
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'COMPLETED', completedTime: new Date().toISOString() } : b
        )
      );
    } catch (err) {
      alert(err.message || "Failed to mark session complete.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.parkingAreaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Fetching system booking database..." fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchBookings} />;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Booking Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit and complete user parking reservations
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search code, lot, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_CHECK_IN">Pending Check-In</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                <th className="py-4 px-6">ID & Code</th>
                <th className="py-4 px-6">Parking Lot</th>
                <th className="py-4 px-6">Slot</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{b.bookingCode}</span>
                    <span className="text-[10px] text-slate-400">#{b.id}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{b.parkingAreaName}</td>
                  <td className="py-4 px-6 font-extrabold text-brand-600 dark:text-brand-400">{b.slotNumber}</td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">{b.vehicleNumber}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{formatCurrency(b.totalAmount)}</td>
                  <td className="py-4 px-6"><StatusBadge status={b.status} /></td>
                  <td className="py-4 px-6 text-right">
                    {b.status === 'CHECKED_IN' && (
                      <Button
                        onClick={() => handleMarkComplete(b.id)}
                        variant="accent"
                        size="sm"
                        icon={CheckCircle}
                      >
                        Complete Session
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
