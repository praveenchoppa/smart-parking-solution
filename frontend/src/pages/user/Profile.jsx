import React, { useState } from 'react';
import { User, Mail, Phone, Shield, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Profile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-brand-600/30">
          {name.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{name}</h1>
            <span className="text-[10px] font-extrabold uppercase bg-brand-500/10 text-brand-600 border border-brand-500/20 px-2 py-0.5 rounded-full">
              {user?.role || 'USER'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{email}</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs p-4 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Account Details
        </h3>

        <Input
          label="Full Name"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address (Read-only)"
          icon={Mail}
          value={email}
          disabled
        />

        <Input
          label="Phone Number"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
