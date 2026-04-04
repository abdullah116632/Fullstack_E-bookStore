'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerAuthService } from '@/services/authService';

export default function UpdatePasswordForm({
  userType = 'reader',
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = 'Current password is required';

    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6)
      newErrors.newPassword = 'Password must be at least 6 characters';
    else if (formData.newPassword === formData.currentPassword)
      newErrors.newPassword = 'New password must be different from current password';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

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
      setIsLoading(true);
      const response = await readerAuthService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(response.data?.message || 'Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            Change Password
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Update your password to keep your account secure
            </span>
          </p>
        </div>

        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
          placeholder="••••••••"
          required
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          placeholder="••••••••"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
        />

        {/* Password Requirements */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
            Password Requirements
          </p>
          <ul className="space-y-1 text-xs text-amber-800">
            <li>✓ At least 6 characters long</li>
            <li>✓ Different from your current password</li>
            <li>✓ Must match the confirmation</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="flex-1 font-semibold"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
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
