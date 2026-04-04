'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import Drawer from '../common/Drawer';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OTPForm from './OTPForm';
import ResetPasswordForm from './ResetPasswordForm';
import UpdateProfileForm from './UpdateProfileForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import UpdateEmailForm from './UpdateEmailForm';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthDrawer({
  isOpen,
  onClose,
  initialUserType = 'reader',
  initialFormType = 'login', // 'login', 'signup', 'otp', 'resetPassword', 'updateProfile', 'updatePassword', 'changeEmail'
}) {
  const [formType, setFormType] = useState(initialFormType);
  const [currentUserType, setCurrentUserType] = useState(initialUserType);
  const { signupEmail } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  // Keep internal state aligned with the requested state whenever the drawer opens.
  useEffect(() => {
    if (isOpen) {
      setFormType(initialFormType);
      setCurrentUserType(initialUserType);
    }
  }, [isOpen, initialFormType, initialUserType]);

  const handleLoginSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handleSignupSuccess = () => {
    setFormType('otp');
  };

  const handleOTPSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handleResetPasswordSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handleProfileUpdateSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handlePasswordUpdateSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handleEmailUpdateSuccess = () => {
    onClose();
    setFormType('login');
  };

  const handleClose = () => {
    onClose();
  };

  const userTypeLabel = {
    reader: t('auth.reader'),
    publisher: t('auth.publisher'),
    admin: t('auth.admin'),
  };

  const getDrawerTitle = () => {
    switch (formType) {
      case 'login':
        return `${userTypeLabel[currentUserType]} ${t('auth.signIn')}`;
      case 'signup':
        return `${userTypeLabel[currentUserType]} ${t('auth.signupTitle')}`;
      case 'otp':
        return t('auth.otpTitle');
      case 'resetPassword':
        return t('auth.resetPassword');
      case 'updateProfile':
        return t('auth.updateProfile');
      case 'updatePassword':
        return t('auth.updatePassword');
      case 'changeEmail':
        return t('profileDropdown.changeEmail');
      default:
        return '';
    }
  };

  const getDrawerContent = () => {
    switch (formType) {
      case 'login':
        return (
          <LoginForm
            userType={currentUserType}
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setFormType('signup')}
            onForgotPassword={() => setFormType('resetPassword')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            userType={currentUserType}
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setFormType('login')}
          />
        );
      case 'otp':
        return (
          <OTPForm
            userType={currentUserType}
            email={signupEmail}
            onSuccess={handleOTPSuccess}
            onBackToSignup={() => setFormType('signup')}
          />
        );
      case 'resetPassword':
        return (
          <ResetPasswordForm
            userType={currentUserType}
            onSuccess={handleResetPasswordSuccess}
            onBackToLogin={() => setFormType('login')}
          />
        );
      case 'updateProfile':
        return (
          <UpdateProfileForm
            userType={currentUserType}
            onSuccess={handleProfileUpdateSuccess}
            onCancel={handleClose}
          />
        );
      case 'updatePassword':
        return (
          <UpdatePasswordForm
            userType={currentUserType}
            onSuccess={handlePasswordUpdateSuccess}
            onCancel={handleClose}
          />
        );
      case 'changeEmail':
        return (
          <UpdateEmailForm
            userType={currentUserType}
            onSuccess={handleEmailUpdateSuccess}
            onCancel={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title={getDrawerTitle()}>
      <AnimatePresence mode="wait">
        <div key={formType}>{getDrawerContent()}</div>
      </AnimatePresence>
    </Drawer>
  );
}
