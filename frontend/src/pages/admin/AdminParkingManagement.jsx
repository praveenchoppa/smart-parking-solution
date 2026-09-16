import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { adminApi } from '../../services/api/adminApi';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatters';

export default function AdminParkingManagement() {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '12.9716',
    longitude: '77.5946',
    hourlyRate: '40',
    totalSlots: '20'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getParkingAreas();
      setParkingAreas([...(data || [])]);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to load parking area administration data.");
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      address: '',
      latitude: '12.9716',
      longitude: '77.5946',
      hourlyRate: '40',
      totalSlots: '20'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      address: item.address,
      latitude: String(item.latitude),
      longitude: String(item.longitude),
      hourlyRate: String(item.hourlyRate),
      totalSlots: String(item.totalSlots)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingItem) {
        await adminApi.updateParkingArea(editingItem.id, formData);
      } else {
        await adminApi.createParkingArea(formData);
      }
      const fresh = await adminApi.getParkingAreas();
      setParkingAreas([...fresh]);
      setSubmitting(false);
      setIsModalOpen(false);
    } catch (err) {
      setSubmitting(false);
      alert(err.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate/delete this parking area?")) return;
    try {
      await adminApi.deleteParkingArea(id);
      const fresh = await adminApi.getParkingAreas();
      setParkingAreas([...fresh]);
    } catch (err) {
      alert(err.message || "Failed to delete parking area.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading parking areas list..." fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchAreas} />;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Parking Area Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, update, and manage parking hubs across the city
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
          Create Parking Area
        </Button>
      </div>

      {/* Parking Areas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parkingAreas.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.address}</span>
                </p>
              </div>

              <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                {formatCurrency(p.hourlyRate)}/hr
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">TOTAL</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{p.totalSlots}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 font-bold block">FREE</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.availableSlots}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-500 font-bold block">OCCUPIED</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{p.occupiedSlots || 0}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={() => handleOpenEdit(p)} variant="outline" size="sm" icon={Edit2}>
                Edit
              </Button>
              <Button onClick={() => handleDelete(p.id)} variant="danger" size="sm" icon={Trash2}>
                Deactivate
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Parking Area' : 'Create Parking Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Parking Area Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. TechHub Central Garage"
            required
          />

          <Input
            label="Full Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 123 Innovation Way, Block A"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hourly Rate (₹)"
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              required
            />
            <Input
              label="Total Slots"
              type="number"
              value={formData.totalSlots}
              onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting} disabled={submitting}>
              {editingItem ? 'Update Area' : 'Create Area'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
