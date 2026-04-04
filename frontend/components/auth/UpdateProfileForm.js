'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerAuthService } from '@/services/authService';

export default function UpdateProfileForm({
  userType = 'reader',
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({ fullName: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useSelector((state) => state.auth);

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await readerAuthService.getProfile();
        if (response.data?.data?.user) {
          setFormData({ fullName: response.data.data.user.fullName });
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2)
      newErrors.fullName = 'Name must be at least 2 characters';
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
      setIsSubmitting(true);
      const response = await readerAuthService.updateProfile(formData);
      toast.success(response.data?.message || 'Profile updated successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full text-center py-8"
      >
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
        <p className="mt-2 text-sm text-slate-600">Loading profile...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <p className="text-sm font-medium text-slate-700">
            Edit Profile
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Update your profile information
            </span>
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Account Email
          </p>
          <p className="text-sm font-medium text-teal-900">{user?.email}</p>
          <p className="text-xs text-teal-600">This cannot be changed</p>
        </div>

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="Your full name"
          required
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="flex-1 font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="flex-1 font-semibold"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
