'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { readerAuthService } from '@/services/authService';
import { setAuthUser } from '@/store/slices/authSlice';

export default function UpdateEmailForm({
  onSuccess,
  onCancel,
}) {
  const [step, setStep] = useState('email');
  const [formData, setFormData] = useState({ newEmail: '', currentPassword: '', otp: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const validateEmailStep = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.newEmail) {
      newErrors.newEmail = 'Email is required';
    } else if (!emailRegex.test(formData.newEmail)) {
      newErrors.newEmail = 'Please enter a valid email address';
    } else if (formData.newEmail === user?.email) {
      newErrors.newEmail = 'New email must be different from current email';
    }

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpStep = () => {
    const newErrors = {};
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmailStep()) return;

    try {
      setIsSubmitting(true);
      const response = await readerAuthService.sendEmailChangeOTP({
        newEmail: formData.newEmail,
        currentPassword: formData.currentPassword,
      });

      toast.success(response.data?.message || 'OTP sent to your new email.');
      setStep('otp');
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtpStep()) return;

    try {
      setIsSubmitting(true);
      const response = await readerAuthService.verifyEmailChangeOTP({
        otp: formData.otp,
      });

      if (response.data?.data?.user) {
        dispatch(setAuthUser(response.data.data.user));
      }

      toast.success(response.data?.message || 'Email updated successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-5">
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <p className="text-sm font-medium text-slate-700">
            {t('profileDropdown.changeEmail')}
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {step === 'email'
                ? 'A verification code will be sent to your new email address'
                : `Enter the 6-digit OTP sent to ${formData.newEmail}`}
            </span>
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Current Email
          </p>
          <p className="text-sm font-medium text-blue-900">{user?.email}</p>
        </div>

        {step === 'email' ? (
          <>
            <Input
              label="New Email Address"
              type="email"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleChange}
              error={errors.newEmail}
              placeholder="Enter your new email address"
              required
            />

            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              placeholder="Enter your current password"
              required
            />
          </>
        ) : (
          <Input
            label="Enter OTP"
            type="text"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            error={errors.otp}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
          />
        )}

        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="w-full font-semibold"
          >
            {isSubmitting ? t('auth.loading') : step === 'email' ? 'Send OTP' : 'Verify OTP and Update Email'}
          </Button>

          {step === 'otp' && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setStep('email');
                setFormData((prev) => ({ ...prev, otp: '' }));
                setErrors({});
              }}
              className="w-full font-semibold"
            >
              Change Email Address
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            className="w-full font-semibold"
          >
            {t('auth.cancel')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
