import React from 'react';
import { Car, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';

export default function VehicleCard({ vehicle, isSelected, onSelect, onEdit, onDelete }) {
  const { id, vehicleNumber, vehicleType } = vehicle;

  return (
    <Card
      onClick={() => onSelect && onSelect(vehicle)}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-brand-600 ring-2 ring-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40'
          : 'hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold font-mono text-slate-900 dark:text-white tracking-wider">
              {vehicleNumber}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
              {vehicleType || 'Car'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="p-1 text-brand-600 dark:text-brand-400">
              <CheckCircle2 className="w-6 h-6 fill-brand-600 text-white" />
            </div>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(vehicle);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Vehicle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
