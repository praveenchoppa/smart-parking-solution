import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ParkingSquare,
  Grid,
  BookOpen,
  QrCode,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Parking Areas', path: '/admin/parking', icon: ParkingSquare },
    { name: 'Bookings', path: '/admin/bookings', icon: BookOpen },
    { name: 'QR Scanner', path: '/admin/scanner', icon: QrCode },
    { name: 'Reports & AI-3', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-4rem)] border-r border-slate-800 p-4 shrink-0 hidden md:block">
      <div className="mb-6 px-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
          Admin Portal
        </span>
        <h2 className="text-base font-bold text-slate-100">Management Console</h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 pt-4 border-t border-slate-800 px-3">
        <Link
          to="/home"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Admin to User View</span>
        </Link>
      </div>
    </aside>
  );
}
