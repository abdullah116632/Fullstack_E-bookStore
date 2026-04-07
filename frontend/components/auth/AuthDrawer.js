'use client';

import { useEffect, useRef, useState } from 'react';
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

const AUTH_DRAWER_MANAGER_STATE_KEY = 'auth-drawer:manager-state';
const AUTH_DRAWER_SIGNUP_EMAIL_KEY = 'auth-drawer:signup-email';
const LEGACY_AUTH_DRAWER_OPEN_KEY = 'drawer:open:auth-drawer';

const VALID_AUTH_FORM_TYPES = new Set([
  'login',
  'signup',
  'otp',
  'resetPasswordEmail',
  'resetPasswordOtp',
  'resetPasswordNewPassword',
  'updateProfile',
  'updatePassword',
  'changeEmail',
]);

const VALID_AUTH_USER_TYPES = new Set(['reader', 'publisher', 'admin']);

const CLOSED_STATE = {
  isOpen: false,
  activeDrawer: null,
  userType: null,
  resetEmail: '',
};

const getValidatedFormType = (value, fallback = 'login') =>
  VALID_AUTH_FORM_TYPES.has(value)
    ? value
    : value === 'resetPassword'
    ? 'resetPasswordEmail'
    : fallback;

const getValidatedUserType = (value, fallback = 'reader') =>
  VALID_AUTH_USER_TYPES.has(value) ? value : fallback;

export default function AuthDrawer({
  isOpen,
  onClose,
  initialUserType = 'reader',
  initialFormType = 'login', // 'login', 'signup', 'otp', 'resetPasswordEmail', 'resetPasswordOtp', 'resetPasswordNewPassword', 'updateProfile', 'updatePassword', 'changeEmail'
}) {
  const [managerState, setManagerState] = useState(CLOSED_STATE);
  const [persistedSignupEmail, setPersistedSignupEmail] = useState('');
  const [isStateRestored, setIsStateRestored] = useState(false);
  const previousIsOpenRef = useRef(isOpen);
  const { signupEmail } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const activeFormType = managerState.activeDrawer;
  const activeUserType = managerState.userType ?? getValidatedUserType(initialUserType);
  const activeResetEmail = managerState.resetEmail || '';
  const otpEmail = signupEmail || persistedSignupEmail;

  const clearPersistedAuthDrawerState = () => {
    localStorage.removeItem(AUTH_DRAWER_MANAGER_STATE_KEY);
    localStorage.removeItem(AUTH_DRAWER_SIGNUP_EMAIL_KEY);
    localStorage.removeItem(LEGACY_AUTH_DRAWER_OPEN_KEY);
    setPersistedSignupEmail('');
  };

  useEffect(() => {
    const rawState = localStorage.getItem(AUTH_DRAWER_MANAGER_STATE_KEY);
    const savedSignupEmail = localStorage.getItem(AUTH_DRAWER_SIGNUP_EMAIL_KEY);
    localStorage.removeItem(LEGACY_AUTH_DRAWER_OPEN_KEY);

    if (savedSignupEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistedSignupEmail(savedSignupEmail);
    }

    if (rawState) {
      try {
        const parsedState = JSON.parse(rawState);

        // Support both current manager format and the legacy format.
        if (
          parsedState?.isOpen === true &&
          VALID_AUTH_FORM_TYPES.has(parsedState?.activeDrawer) &&
          VALID_AUTH_USER_TYPES.has(parsedState?.userType)
        ) {
          setManagerState({
            isOpen: true,
            activeDrawer: parsedState.activeDrawer,
            userType: parsedState.userType,
            resetEmail: typeof parsedState?.resetEmail === 'string' ? parsedState.resetEmail : '',
          });
        } else if (
          VALID_AUTH_FORM_TYPES.has(parsedState?.formType) &&
          VALID_AUTH_USER_TYPES.has(parsedState?.userType)
        ) {
          setManagerState({
            isOpen: true,
            activeDrawer: parsedState.formType,
            userType: parsedState.userType,
            resetEmail: typeof parsedState?.resetEmail === 'string' ? parsedState.resetEmail : '',
          });
        }
      } catch {
        localStorage.removeItem(AUTH_DRAWER_MANAGER_STATE_KEY);
      }
    }

    setIsStateRestored(true);
  }, []);

  useEffect(() => {
    const wasOpen = previousIsOpenRef.current;

    if (isOpen && !wasOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setManagerState({
        isOpen: true,
        activeDrawer: getValidatedFormType(initialFormType),
        userType: getValidatedUserType(initialUserType),
        resetEmail: '',
      });
    }

    if (!isOpen && wasOpen) {
      setManagerState(CLOSED_STATE);
    }

    previousIsOpenRef.current = isOpen;
  }, [initialFormType, initialUserType, isOpen]);

  useEffect(() => {
    if (!isStateRestored) return;

    if (managerState.isOpen && activeFormType && activeUserType) {
      localStorage.setItem(
        AUTH_DRAWER_MANAGER_STATE_KEY,
        JSON.stringify({
          isOpen: true,
          activeDrawer: activeFormType,
          userType: activeUserType,
          resetEmail: activeResetEmail,
        })
      );
      return;
    }

    localStorage.removeItem(AUTH_DRAWER_MANAGER_STATE_KEY);
  }, [activeFormType, activeResetEmail, activeUserType, isStateRestored, managerState.isOpen]);

  useEffect(() => {
    if (!signupEmail) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersistedSignupEmail(signupEmail);
    localStorage.setItem(AUTH_DRAWER_SIGNUP_EMAIL_KEY, signupEmail);
  }, [signupEmail]);

  const openDrawer = (drawerType, options = {}) => {
    if (!VALID_AUTH_FORM_TYPES.has(drawerType)) return;

    setManagerState((prev) => ({
      isOpen: true,
      activeDrawer: drawerType,
      userType: prev.userType ?? getValidatedUserType(initialUserType),
      resetEmail: options.resetEmail ?? prev.resetEmail ?? '',
    }));
  };

  const handleResetPasswordStepChange = (nextStep) => {
    if (nextStep === 'email') openDrawer('resetPasswordEmail');
    if (nextStep === 'otp') openDrawer('resetPasswordOtp');
    if (nextStep === 'newPassword') openDrawer('resetPasswordNewPassword');
  };

  const handleResetPasswordEmailSubmitted = (normalizedEmail) => {
    openDrawer('resetPasswordOtp', { resetEmail: normalizedEmail });
  };

  const closeAllDrawers = ({ clearPersistedState = true } = {}) => {
    setManagerState(CLOSED_STATE);

    if (clearPersistedState) {
      clearPersistedAuthDrawerState();
    }

    onClose();
  };

  const handleLoginSuccess = () => {
    closeAllDrawers();
  };

  const handleSignupSuccess = () => {
    openDrawer('otp');
  };

  const handleOTPSuccess = () => {
    closeAllDrawers();
  };

  const handleResetPasswordSuccess = () => {
    closeAllDrawers();
  };

  const handleProfileUpdateSuccess = () => {
    closeAllDrawers();
  };

  const handlePasswordUpdateSuccess = () => {
    closeAllDrawers();
  };

  const handleEmailUpdateSuccess = () => {
    closeAllDrawers();
  };

  const handleClose = () => {
    closeAllDrawers();
  };

  const userTypeLabel = {
    reader: t('auth.reader'),
    publisher: t('auth.publisher'),
    admin: t('auth.admin'),
  };

  const signupTitleByUserType = {
    reader: t('auth.signupReaderTitle'),
    publisher: t('auth.signupPublisherTitle'),
    admin: t('auth.signupAdminTitle'),
  };

  const getDrawerTitle = (drawerType) => {
    switch (drawerType) {
      case 'login':
        return `${userTypeLabel[activeUserType]} ${t('auth.signIn')}`;
      case 'signup':
        return signupTitleByUserType[activeUserType] || t('auth.signupTitle');
      case 'otp':
        return t('auth.otpTitle');
      case 'resetPasswordEmail':
        return t('auth.resetPassword');
      case 'resetPasswordOtp':
        return t('auth.otpTitle');
      case 'resetPasswordNewPassword':
        return t('auth.newPassword');
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

  return (
    <>
      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'login'}
        onClose={handleClose}
        title={getDrawerTitle('login')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="login">
            <LoginForm
              userType={activeUserType}
              onSuccess={handleLoginSuccess}
              onSwitchToSignup={() => openDrawer('signup')}
              onForgotPassword={() => openDrawer('resetPasswordEmail', { resetEmail: '' })}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'signup'}
        onClose={handleClose}
        title={getDrawerTitle('signup')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="signup">
            <SignupForm
              userType={activeUserType}
              onSuccess={handleSignupSuccess}
              onSwitchToLogin={() => openDrawer('login')}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'otp'}
        onClose={handleClose}
        title={getDrawerTitle('otp')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="otp">
            <OTPForm
              userType={activeUserType}
              email={otpEmail}
              onSuccess={handleOTPSuccess}
              onBackToSignup={() => openDrawer('signup')}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'resetPasswordEmail'}
        onClose={handleClose}
        title={getDrawerTitle('resetPasswordEmail')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="resetPasswordEmail">
            <ResetPasswordForm
              userType={activeUserType}
              initialEmail={activeResetEmail}
              forcedStep="email"
              onEmailSubmitted={handleResetPasswordEmailSubmitted}
              onStepChange={handleResetPasswordStepChange}
              onSuccess={handleResetPasswordSuccess}
              onBackToLogin={() => openDrawer('login')}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'resetPasswordOtp'}
        onClose={handleClose}
        title={getDrawerTitle('resetPasswordOtp')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="resetPasswordOtp">
            <ResetPasswordForm
              userType={activeUserType}
              initialEmail={activeResetEmail}
              forcedStep="otp"
              onEmailSubmitted={handleResetPasswordEmailSubmitted}
              onStepChange={handleResetPasswordStepChange}
              onSuccess={handleResetPasswordSuccess}
              onBackToLogin={() => openDrawer('login')}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'resetPasswordNewPassword'}
        onClose={handleClose}
        title={getDrawerTitle('resetPasswordNewPassword')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="resetPasswordNewPassword">
            <ResetPasswordForm
              userType={activeUserType}
              initialEmail={activeResetEmail}
              forcedStep="newPassword"
              onEmailSubmitted={handleResetPasswordEmailSubmitted}
              onStepChange={handleResetPasswordStepChange}
              onSuccess={handleResetPasswordSuccess}
              onBackToLogin={() => openDrawer('login')}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'updateProfile'}
        onClose={handleClose}
        title={getDrawerTitle('updateProfile')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="updateProfile">
            <UpdateProfileForm
              userType={activeUserType}
              onSuccess={handleProfileUpdateSuccess}
              onCancel={handleClose}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'updatePassword'}
        onClose={handleClose}
        title={getDrawerTitle('updatePassword')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="updatePassword">
            <UpdatePasswordForm
              userType={activeUserType}
              onSuccess={handlePasswordUpdateSuccess}
              onCancel={handleClose}
            />
          </div>
        </AnimatePresence>
      </Drawer>

      <Drawer
        isOpen={managerState.isOpen && activeFormType === 'changeEmail'}
        onClose={handleClose}
        title={getDrawerTitle('changeEmail')}
        disablePersistence
      >
        <AnimatePresence mode="wait">
          <div key="changeEmail">
            <UpdateEmailForm
              userType={activeUserType}
              onSuccess={handleEmailUpdateSuccess}
              onCancel={handleClose}
            />
          </div>
        </AnimatePresence>
      </Drawer>
    </>
  );
}
