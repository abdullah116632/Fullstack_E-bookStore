'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import {
  readerForgotPassword,
  readerResendResetOTP,
  readerVerifyResetOTP,
  readerResetPassword,
  publisherForgotPassword,
  publisherResendResetOTP,
  publisherVerifyResetOTP,
  publisherResetPassword,
  adminForgotPassword,
  adminResendResetOTP,
  adminVerifyResetOTP,
  adminResetPassword,
} from '@/store/slices/authSlice';

const getResetFlowStorageKey = (userType) => `auth-reset-flow:${userType || 'reader'}`;

export default function ResetPasswordForm({
  userType = 'reader',
  initialEmail,
  forcedStep,
  onEmailSubmitted,
  onStepChange,
  onSuccess,
  onBackToLogin,
}) {
  const ADMIN_OTP_EMAIL = 'abdullah116632@gmail.com';
  const [step, setStep] = useState('email'); // email, otp, newPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [isFlowRestored, setIsFlowRestored] = useState(false);

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const forgotPasswordAction = userType === 'publisher'
    ? publisherForgotPassword
    : userType === 'admin'
    ? adminForgotPassword
    : readerForgotPassword;
  const resendResetOTPAction = userType === 'publisher'
    ? publisherResendResetOTP
    : userType === 'admin'
    ? adminResendResetOTP
    : readerResendResetOTP;
  const verifyResetOTPAction = userType === 'publisher'
    ? publisherVerifyResetOTP
    : userType === 'admin'
    ? adminVerifyResetOTP
    : readerVerifyResetOTP;
  const resetPasswordAction = userType === 'publisher'
    ? publisherResetPassword
    : userType === 'admin'
    ? adminResetPassword
    : readerResetPassword;

  const getNormalizedEmail = () => String(email || '').trim().toLowerCase();

  const setFlowStep = (nextStep, { notifyParent = true } = {}) => {
    if (nextStep !== 'email' && nextStep !== 'otp' && nextStep !== 'newPassword') return;
    setStep(nextStep);
    if (notifyParent && onStepChange) {
      onStepChange(nextStep);
    }
  };

  const clearPersistedResetFlow = () => {
    localStorage.removeItem(getResetFlowStorageKey(userType));
  };

  useEffect(() => {
    if (!initialEmail) return;
    setEmail(String(initialEmail).trim().toLowerCase());
  }, [initialEmail]);

  useEffect(() => {
    const rawSavedState = localStorage.getItem(getResetFlowStorageKey(userType));
    if (!rawSavedState) {
      if (forcedStep) {
        setFlowStep(forcedStep, { notifyParent: false });
      }
      setIsFlowRestored(true);
      return;
    }

    try {
      const savedState = JSON.parse(rawSavedState);
      if (
        !forcedStep &&
        (savedState?.step === 'email' || savedState?.step === 'otp' || savedState?.step === 'newPassword')
      ) {
        setFlowStep(savedState.step, { notifyParent: false });
      }
      if (typeof savedState?.email === 'string') {
        setEmail(savedState.email);
      }
      if (typeof savedState?.resendTimer === 'number' && savedState.resendTimer > 0) {
        setResendTimer(savedState.resendTimer);
      }

      if (forcedStep) {
        setFlowStep(forcedStep, { notifyParent: false });
      }
    } catch {
      localStorage.removeItem(getResetFlowStorageKey(userType));
    } finally {
      setIsFlowRestored(true);
    }
  }, [userType, forcedStep]);

  useEffect(() => {
    if (!forcedStep) return;
    setFlowStep(forcedStep, { notifyParent: false });
  }, [forcedStep]);

  useEffect(() => {
    if (!isFlowRestored) return;

    localStorage.setItem(
      getResetFlowStorageKey(userType),
      JSON.stringify({
        step,
        email,
        resendTimer,
      })
    );
  }, [isFlowRestored, userType, step, email, resendTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = () => {
    const newErrors = {};
    const normalizedEmail = getNormalizedEmail();
    if (!normalizedEmail) newErrors.email = 'Email is required';
    else if (!normalizedEmail.includes('@')) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    else if (otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
    else if (!/^\d{6}$/.test(otp)) newErrors.otp = 'OTP must contain only numbers';
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

    const normalizedEmail = getNormalizedEmail();

    try {
      const response = await dispatch(
        forgotPasswordAction({ email: normalizedEmail })
      ).unwrap();
      toast.success(response.message || t('auth.otpSent'));
      setEmail(normalizedEmail);
      localStorage.setItem(
        getResetFlowStorageKey(userType),
        JSON.stringify({
          step: 'otp',
          email: normalizedEmail,
          resendTimer,
        })
      );
      if (onEmailSubmitted) {
        onEmailSubmitted(normalizedEmail);
      }
      setFlowStep('otp');
      setErrors({});
    } catch (err) {
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (!validateOTP()) return;

    const normalizedEmail = getNormalizedEmail() || String(initialEmail || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setErrors({ email: 'Email is required' });
      toast.error('Email is missing. Please request OTP again.');
      return;
    }

    try {
      const response = await dispatch(
        verifyResetOTPAction({ email: normalizedEmail, otp: otp.trim() })
      ).unwrap();
      toast.success(response.message || t('auth.success'));
      setFlowStep('newPassword');
      setErrors({});
    } catch (err) {
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handleResendOTP = async () => {
    const normalizedEmail = getNormalizedEmail() || String(initialEmail || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setErrors({ email: 'Email is required' });
      toast.error('Email is missing. Please request OTP again.');
      return;
    }

    try {
      const response = await dispatch(
        resendResetOTPAction({ email: normalizedEmail })
      ).unwrap();
      toast.success(response.message || t('auth.otpSent'));
      setResendTimer(120);
      setOtp('');
      setErrors({});
    } catch (err) {
      toast.error(err?.message || t('auth.otpFailed'));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const normalizedEmail = getNormalizedEmail();
    if (!normalizedEmail) {
      setErrors({ email: 'Email is required' });
      setFlowStep('email');
      return;
    }

    try {
      const response = await dispatch(
        resetPasswordAction({ email: normalizedEmail, newPassword })
      ).unwrap();
      toast.success(response.message || t('auth.success'));
      clearPersistedResetFlow();
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
                {t('auth.otpSent')} <span className="font-bold">{userType === 'admin' ? ADMIN_OTP_EMAIL : email}</span>
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

            <div className="text-center">
              <p className="mb-2 text-sm text-slate-600">{t('auth.didntGetOtp')}</p>
              {resendTimer > 0 ? (
                <p className="text-sm text-slate-600">
                  {t('auth.resendIn')} <span className="font-semibold text-teal-700">{resendTimer}{t('auth.seconds')}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('auth.resendOtp')}
                </button>
              )}
            </div>
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
                if (step === 'otp') setFlowStep('email');
                else setFlowStep('otp');
                setErrors({});
              }}
              className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-slate-700"
            >
              ← Go Back
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              clearPersistedResetFlow();
              onBackToLogin();
            }}
            className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700"
          >
            Back to Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}
