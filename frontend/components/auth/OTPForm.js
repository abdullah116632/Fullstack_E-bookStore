'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerVerifySignup, publisherVerifySignup } from '@/store/slices/authSlice';

export default function OTPForm({ userType = 'reader', email, onSuccess, onBackToSignup }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

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

      toast.success(response.message || 'Email verified successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
      toast.error(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = () => {
    toast.success('OTP resent to your email');
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
          <h3 className="mb-2 text-lg font-semibold text-slate-900">Verify Your Email</h3>
          <p className="text-sm text-slate-600">
            We sent a 6-digit OTP to <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3.5">
          <p className="text-sm text-teal-800">
            Enter the OTP sent to your email. It will expire in 10 minutes.
          </p>
        </div>

        <Input
          label="One-Time Password (OTP)"
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
          Verify OTP
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-slate-600">
              Resend OTP in <span className="font-semibold text-teal-700">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
            >
              Didn't receive OTP? Resend
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBackToSignup}
          className="w-full text-center text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          Back to signup
        </button>
      </form>
    </motion.div>
  );
}
