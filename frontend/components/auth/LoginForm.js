'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerLogin, publisherLogin, adminLogin } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function LoginForm({ userType = 'reader', onSuccess, onSwitchToSignup, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, userType: authUserType } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t('auth.email');
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = t('auth.password');
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
      
      toast.success(response.message || t('auth.success'));
      if (userType === 'reader') {
        router.push('/active-book');
      } else if (userType === 'publisher') {
        router.push('/publisher');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.message || t('auth.loginFailed'));
    }
  };

  const userTypeLabels = {
    reader: t('auth.reader'),
    publisher: t('auth.publisher'),
    admin: t('auth.admin'),
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
            {t('auth.loggingInAs')} <span className="font-bold uppercase tracking-wide">{userTypeLabels[userType]}</span>
          </p>
        </div>

        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
        />

        <Input
          label={t('auth.password')}
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
            <span className="text-xs font-medium text-slate-600">{t('auth.rememberMe')}</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            {t('auth.forgotPassword')}
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
          {isLoading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>

        <button
          type="button"
          onClick={onSwitchToSignup}
          className="w-full py-2 text-center text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-teal-700"
        >
          {t('auth.noAccount')} <span className="font-bold text-teal-700">{t('auth.createOne')}</span>
        </button>
      </form>
    </motion.div>
  );
}
