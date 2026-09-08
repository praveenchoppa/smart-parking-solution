import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Car, User } from 'lucide-react';

export default function QuickAction() {
  const actions = [
    { name: 'Find Parking', path: '/dashboard', icon: MapPin, color: 'bg-brand-500/10 text-brand-600 dark:text-brand-400' },
    { name: 'My Bookings', path: '/bookings', icon: Clock, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { name: 'My Vehicles', path: '/vehicles', icon: Car, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { name: 'My Profile', path: '/profile', icon: User, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.name}
              to={act.path}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-2xl mb-2 transition-transform group-hover:scale-110 ${act.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center">{act.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
