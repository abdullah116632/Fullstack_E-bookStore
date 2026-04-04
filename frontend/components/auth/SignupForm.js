'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerSignup, publisherSignup, setSignupEmail } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function SignupForm({ userType = 'reader', onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Publisher only fields
    publisherName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      zipCode: '',
    },
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors = {};
    
    // Common validation
    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Publisher validation
    if (userType === 'publisher') {
      if (!formData.publisherName || formData.publisherName.length < 2) {
        newErrors.publisherName = 'Publisher name must be at least 2 characters';
      }
      if (!/^\d{11}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Mobile number must be exactly 11 digits';
      }
      if (!formData.address.street) newErrors['address.street'] = 'Street is required';
      if (!formData.address.city) newErrors['address.city'] = 'City is required';
      if (!formData.address.zipCode) newErrors['address.zipCode'] = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      if (userType === 'publisher') {
        submitData.publisherName = formData.publisherName;
        submitData.phoneNumber = formData.phoneNumber;
        submitData.address = formData.address;
      }

      let response;
      if (userType === 'reader') {
        response = await dispatch(readerSignup(submitData)).unwrap();
      } else if (userType === 'publisher') {
        response = await dispatch(publisherSignup(submitData)).unwrap();
      }

      dispatch(setSignupEmail(submitData.email));
      toast.success(response.message || t('auth.otpSent'));
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.message || t('auth.signupFailed'));
    }
  };

  const userTypeLabels = {
    reader: t('auth.reader'),
    publisher: t('auth.publisher'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
          <p className="text-sm font-medium text-teal-800">
            {t('auth.signingUpAs')} <span className="font-bold uppercase tracking-wide">{userTypeLabels[userType]}</span>
          </p>
        </div>

        <Input
          label={t('auth.fullName')}
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="John Doe"
          required
        />

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

        {userType === 'publisher' && (
          <>
            <Input
              label={t('auth.publisherName')}
              type="text"
              name="publisherName"
              value={formData.publisherName}
              onChange={handleChange}
              error={errors.publisherName}
              placeholder="Your Publishing House"
              required
            />

            <Input
              label={t('auth.phoneNumber')}
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
                const customEvent = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'phoneNumber',
                    value: digitsOnly,
                  },
                };
                handleChange(customEvent);
              }}
              error={errors.phoneNumber}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              required
            />

            <div className="border-t pt-4 mt-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Address Information</h3>
              <Input
                label={t('auth.street')}
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                error={errors['address.street']}
                placeholder="123 Main Street"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('auth.city')}
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  error={errors['address.city']}
                  placeholder="Dhaka"
                  required
                />

                <Input
                  label={t('auth.zipCode')}
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  error={errors['address.zipCode']}
                  placeholder="1205"
                  required
                />
              </div>

            </div>
          </>
        )}

        <Input
          label={t('auth.password')}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="At least 6 characters"
          required
        />

        <Input
          label={t('auth.confirmPassword')}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
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

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
        >
          {t('auth.haveAccount')} <span className="font-bold text-teal-700">{t('auth.signIn')}</span>
        </button>
      </form>
    </motion.div>
  );
}
