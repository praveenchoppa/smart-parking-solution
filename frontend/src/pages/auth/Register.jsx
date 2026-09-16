import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, ParkingSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\s+/g, ''),
        password: formData.password
      });
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl max-w-md w-full">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-600/30">
            <ParkingSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join Smart Urban Parking Solution today
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl mb-6 font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            name="name"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={UserPlus}
            className="w-full mt-4"
          >
            Register Account
          </Button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
