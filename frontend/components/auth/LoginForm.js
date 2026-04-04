'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerLogin, publisherLogin, adminLogin } from '@/store/slices/authSlice';

export default function LoginForm({ userType = 'reader', onSuccess, onSwitchToSignup, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, userType: authUserType } = useSelector((state) => state.auth);

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && authUserType === 'reader') {
      setTimeout(() => {
        router.push('/active-book');
      }, 1000);
    }
  }, [isAuthenticated, authUserType, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (userType === 'reader') {
        response = await dispatch(readerLogin(formData)).unwrap();
      } else if (userType === 'publisher') {
        response = await dispatch(publisherLogin(formData)).unwrap();
      } else if (userType === 'admin') {
        response = await dispatch(adminLogin(formData)).unwrap();
      }
      
      toast.success(response.message || 'Login successful!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please try again.');
    }
  };

  const userTypeLabels = {
    reader: 'Reader',
    publisher: 'Publisher',
    admin: 'Admin',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
          <p className="text-sm font-medium text-teal-800">
            Logging in as <span className="font-bold uppercase tracking-wide">{userTypeLabels[userType]}</span>
          </p>
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-slate-300" />
            <span className="text-xs font-medium text-slate-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            Forgot Password?
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="w-full font-semibold"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <button
          type="button"
          onClick={onSwitchToSignup}
          className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700"
        >
          Don't have an account? <span className="font-bold text-teal-700">Create one</span>
        </button>
      </form>
    </motion.div>
  );
}
