'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import Drawer from '../common/Drawer';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OTPForm from './OTPForm';
import ResetPasswordForm from './ResetPasswordForm';
import UpdateProfileForm from './UpdateProfileForm';
import UpdatePasswordForm from './UpdatePasswordForm';

export default function AuthDrawer({
  isOpen,
  onClose,
  initialUserType = 'reader',
  initialFormType = 'login', // 'login', 'signup', 'otp', 'resetPassword', 'updateProfile', 'updatePassword'
}) {
  const [formType, setFormType] = useState(initialFormType);
  const [currentUserType, setCurrentUserType] = useState(initialUserType);
  const { signupEmail } = useSelector((state) => state.auth);

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

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFormType('login');
    }, 300);
  };

  const getDrawerTitle = () => {
    switch (formType) {
      case 'login':
        return `${currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)} Login`;
      case 'signup':
        return `${currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1)} Sign Up`;
      case 'otp':
        return 'Verify Your Email';
      case 'resetPassword':
        return 'Reset Password';
      case 'updateProfile':
        return 'Edit Profile';
      case 'updatePassword':
        return 'Change Password';
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
