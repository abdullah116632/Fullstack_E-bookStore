'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { readerSignup, publisherSignup, setSignupEmail } from '@/store/slices/authSlice';

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
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

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
      if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
        newErrors.phoneNumber = 'Valid phone number is required';
      }
      if (!formData.address.street) newErrors['address.street'] = 'Street is required';
      if (!formData.address.city) newErrors['address.city'] = 'City is required';
      if (!formData.address.state) newErrors['address.state'] = 'State is required';
      if (!formData.address.zipCode) newErrors['address.zipCode'] = 'Zip code is required';
      if (!formData.address.country) newErrors['address.country'] = 'Country is required';
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
      toast.success(response.message || 'OTP sent to your email!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.message || 'Signup failed. Please try again.');
    }
  };

  const userTypeLabels = {
    reader: 'Reader',
    publisher: 'Publisher',
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
            Signing up as <span className="font-bold uppercase tracking-wide">{userTypeLabels[userType]}</span>
          </p>
        </div>

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          placeholder="John Doe"
          required
        />

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

        {userType === 'publisher' && (
          <>
            <Input
              label="Publisher Name"
              type="text"
              name="publisherName"
              value={formData.publisherName}
              onChange={handleChange}
              error={errors.publisherName}
              placeholder="Your Publishing House"
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="+1-234-567-8900"
              required
            />

            <div className="border-t pt-4 mt-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Address Information</h3>
              <Input
                label="Street Address"
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
                  label="City"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  error={errors['address.city']}
                  placeholder="New York"
                  required
                />

                <Input
                  label="State"
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  error={errors['address.state']}
                  placeholder="NY"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Zip Code"
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  error={errors['address.zipCode']}
                  placeholder="10001"
                  required
                />

                <Input
                  label="Country"
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  error={errors['address.country']}
                  placeholder="USA"
                  required
                />
              </div>
            </div>
          </>
        )}

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="At least 6 characters"
          required
        />

        <Input
          label="Confirm Password"
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
          Continue to OTP Verification
        </Button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full text-center text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
        >
          Already have an account? <span className="font-bold text-teal-700">Login</span>
        </button>
      </form>
    </motion.div>
  );
}
