'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerVerifySignup, publisherVerifySignup } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function OTPForm({ userType = 'reader', email, onSuccess, onBackToSignup }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateOTP = () => {
    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits');
      return false;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must contain only numbers');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;

    try {
      let response;
      const verifyData = { email, otp };

      if (userType === 'reader') {
        response = await dispatch(readerVerifySignup(verifyData)).unwrap();
      } else if (userType === 'publisher') {
        response = await dispatch(publisherVerifySignup(verifyData)).unwrap();
      }

      toast.success(response.message || t('auth.verifySuccess'));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.message || t('auth.otpFailed'));
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handleResend = () => {
    toast.success(t('auth.otpSent'));
    setResendTimer(60);
    setOtp('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-slate-900">{t('auth.otpTitle')}</h3>
          <p className="text-sm text-slate-600">
            {t('auth.otpDescription')} <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3.5">
          <p className="text-sm text-teal-800">
            {t('auth.otpDescription')}
          </p>
        </div>

        <Input
          label={t('auth.otp')}
          type="text"
          inputMode="numeric"
          value={otp}
          onChange={handleChange}
          error={error}
          placeholder="000000"
          maxLength="6"
          className="text-center text-2xl tracking-[0.4em] font-bold"
          required
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="w-full"
        >
          {t('auth.verifyEmail')}
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-slate-600">
              {t('auth.resendIn')} <span className="font-semibold text-teal-700">{resendTimer}{t('auth.seconds')}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
            >
              {t('auth.resendOtp')}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBackToSignup}
          className="w-full text-center text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          {t('auth.backToSignup')}
        </button>
      </form>
    </motion.div>
  );
}
