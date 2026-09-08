import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts & Route Protections
import UserLayout from './layouts/UserLayout';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Dashboard from './pages/user/Dashboard';
import ParkingDetails from './pages/user/ParkingDetails';
import SlotSelection from './pages/user/SlotSelection';
import VehicleManagement from './pages/user/VehicleManagement';
import BookingConfirmation from './pages/user/BookingConfirmation';
import Payment from './pages/user/Payment';
import BookingSuccess from './pages/user/BookingSuccess';
import QRBookingPass from './pages/user/QRBookingPass';
import CurrentBooking from './pages/user/CurrentBooking';
import BookingHistory from './pages/user/BookingHistory';
import BookingDetails from './pages/user/BookingDetails';
import Profile from './pages/user/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminParkingManagement from './pages/admin/AdminParkingManagement';
import AdminSlotManagement from './pages/admin/AdminSlotManagement';
import AdminBookingManagement from './pages/admin/AdminBookingManagement';
import AdminQRScanner from './pages/admin/AdminQRScanner';
import AdminReports from './pages/admin/AdminReports';

function AdminLayoutWrapper() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="/parking/:id" element={<ParkingDetails />} />
            <Route path="/parking/:id/slots" element={<SlotSelection />} />
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/booking" element={<BookingConfirmation />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/booking/:id" element={<BookingDetails />} />
            <Route path="/booking/:id/qr" element={<QRBookingPass />} />
            <Route path="/current-booking" element={<CurrentBooking />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/history" element={<Navigate to="/bookings" replace />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <AdminRoute>
                <AdminLayoutWrapper />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/parking" element={<AdminParkingManagement />} />
            <Route path="/admin/parking/:id/slots" element={<AdminSlotManagement />} />
            <Route path="/admin/bookings" element={<AdminBookingManagement />} />
            <Route path="/admin/scanner" element={<AdminQRScanner />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
