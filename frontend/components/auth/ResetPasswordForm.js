'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import {
  readerForgotPassword,
  readerVerifyResetOTP,
  readerResetPassword,
} from '@/store/slices/authSlice';

export default function ResetPasswordForm({
  userType = 'reader',
  onSuccess,
  onBackToLogin,
}) {
  const [step, setStep] = useState('email'); // email, otp, newPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const validateEmail = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    else if (otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'New password is required';
    else if (newPassword.length < 6)
      newErrors.newPassword = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      const response = await dispatch(
        readerForgotPassword({ email })
      ).unwrap();
      toast.success(response.message || t('auth.otpSent'));
      setStep('otp');
      setErrors({});
    } catch (err) {
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;

    try {
      const response = await dispatch(
        readerVerifyResetOTP({ email, otp })
      ).unwrap();
      toast.success(response.message || t('auth.success'));
      setStep('newPassword');
      setErrors({});
    } catch (err) {
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      const response = await dispatch(
        readerResetPassword({ email, newPassword })
      ).unwrap();
      toast.success(response.message || t('auth.success'));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.message || t('auth.error'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={(e) => {
        if (step === 'email') handleEmailSubmit(e);
        else if (step === 'otp') handleOTPSubmit(e);
        else handlePasswordSubmit(e);
      }} className="space-y-5">
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <p className="text-sm font-medium text-slate-700">
            {t('auth.resetPassword')}
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {step === 'email' && t('auth.email')}
              {step === 'otp' && t('auth.otpDescription')}
              {step === 'newPassword' && t('auth.newPassword')}
            </span>
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            error={errors.email}
            placeholder="you@example.com"
            required
          />
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-xs text-blue-700 font-medium">
                {t('auth.otpSent')} <span className="font-bold">{email}</span>
              </p>
            </div>
            <Input
              label={t('auth.enterOtp')}
              type="text"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                if (errors.otp) setErrors({});
              }}
              error={errors.otp}
              placeholder="000000"
              maxLength="6"
              required
            />
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'newPassword' && (
          <>
            <Input
              label={t('auth.newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors({});
              }}
              error={errors.newPassword}
              placeholder="••••••••"
              required
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({});
              }}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full font-semibold"
          >
            {isLoading
              ? 'Please wait...'
              : step === 'email'
              ? 'Send OTP'
              : step === 'otp'
              ? 'Verify OTP'
              : 'Reset Password'}
          </Button>

          {step !== 'email' && (
            <button
              type="button"
              onClick={() => {
                if (step === 'otp') setStep('email');
                else setStep('otp');
                setErrors({});
              }}
              className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-slate-700"
            >
              ← Go Back
            </button>
          )}

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700"
          >
            Back to Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}
