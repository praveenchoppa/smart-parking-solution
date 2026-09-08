import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Car, ArrowRight, ShieldCheck } from 'lucide-react';
import { vehicleApi } from '../../services/api/vehicleApi';
import VehicleCard from '../../components/vehicle/VehicleCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function VehicleManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  // Route state carried from slot selection flow (if booking)
  const bookingState = location.state || {};
  const isBookingFlow = Boolean(bookingState.selectedSlot);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleApi.getVehicles();
      setVehicles(data || []);
      if (data && data.length > 0) {
        setSelectedVehicle(data[0]);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Unable to load user vehicles.");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setVehicleNumber('');
    setVehicleType('CAR');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (veh) => {
    setEditingVehicle(veh);
    setVehicleNumber(veh.vehicleNumber);
    setVehicleType(veh.vehicleType || 'CAR');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    setFormError('');

    const formattedNumber = vehicleNumber.trim().toUpperCase();
    if (!formattedNumber || formattedNumber.length < 5) {
      setFormError("Please enter a valid vehicle license plate number.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingVehicle) {
        const updated = await vehicleApi.updateVehicle(editingVehicle.id, {
          vehicleNumber: formattedNumber,
          vehicleType
        });
        setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? updated : v)));
      } else {
        const created = await vehicleApi.addVehicle({
          vehicleNumber: formattedNumber,
          vehicleType
        });
        setVehicles([...vehicles, created]);
        setSelectedVehicle(created);
      }
      setFormSubmitting(false);
      setIsModalOpen(false);
    } catch (err) {
      setFormSubmitting(false);
      setFormError(err.message || "Failed to save vehicle.");
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      await vehicleApi.deleteVehicle(id);
      setVehicles(vehicles.filter((v) => v.id !== id));
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(vehicles.find((v) => v.id !== id) || null);
      }
    } catch (err) {
      alert("Failed to delete vehicle.");
    }
  };

  const handleProceedToConfirmation = () => {
    if (!selectedVehicle || !isBookingFlow) return;
    navigate('/booking', {
      state: {
        parkingAreaId: bookingState.parkingAreaId,
        selectedSlot: bookingState.selectedSlot,
        selectedVehicle
      }
    });
  };

  if (loading) return <LoadingSpinner message="Loading user registered vehicles..." fullScreen />;
  if (error) return <ErrorState message={error} onRetry={fetchVehicles} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isBookingFlow ? 'Select Your Vehicle' : 'Vehicle Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBookingFlow
              ? 'Choose which registered vehicle you will park for this session'
              : 'Add, update, or remove your registered vehicles'}
          </p>
        </div>

        <Button onClick={handleOpenAddModal} variant="primary" size="md" icon={Plus}>
          Add New Vehicle
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          title="No Vehicles Registered"
          message="You have no registered vehicles. Add your vehicle plate number to continue."
          icon={Car}
          actionLabel="Add New Vehicle"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((veh) => (
            <VehicleCard
              key={veh.id}
              vehicle={veh}
              isSelected={selectedVehicle?.id === veh.id}
              onSelect={setSelectedVehicle}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteVehicle}
            />
          ))}
        </div>
      )}

      {/* Booking Flow Sticky Action Footer */}
      {isBookingFlow && (
        <div className="sticky bottom-4 bg-slate-900/95 text-white backdrop-blur border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl mt-8">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Vehicle</span>
            <span className="text-base font-extrabold text-white font-mono">
              {selectedVehicle ? selectedVehicle.vehicleNumber : 'None Selected'}
            </span>
          </div>

          <Button
            onClick={handleProceedToConfirmation}
            disabled={!selectedVehicle}
            variant="accent"
            size="md"
            icon={ArrowRight}
          >
            Confirm & Proceed to Booking
          </Button>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs p-3 rounded-xl mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <Input
            label="Vehicle Number / License Plate"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            placeholder="e.g. KL05AB1234"
            required
          />

          <Select
            label="Vehicle Type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={[
              { value: 'CAR', label: 'Car / Sedan' },
              { value: 'SUV', label: 'SUV / Crossover' },
              { value: 'HATCHBACK', label: 'Hatchback' },
              { value: 'EV', label: 'Electric Vehicle (EV)' },
              { value: 'BIKE', label: 'Two-Wheeler / Motorbike' }
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={formSubmitting}>
              {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
