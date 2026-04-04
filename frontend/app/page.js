'use client';

import { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/common/Footer';
import AuthDrawer from '@/components/auth/AuthDrawer';

export default function Home() {
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authUserType, setAuthUserType] = useState('reader');
  const [authFormType, setAuthFormType] = useState('login');

  const handleLoginClick = () => {
    setAuthUserType('reader');
    setAuthFormType('login');
    setAuthDrawerOpen(true);
  };

  const handleSignupClick = () => {
    setAuthUserType('reader');
    setAuthFormType('signup');
    setAuthDrawerOpen(true);
  };

  const handleEditProfile = () => {
    setAuthFormType('updateProfile');
    setAuthDrawerOpen(true);
  };

  const handleUpdatePassword = () => {
    setAuthFormType('updatePassword');
    setAuthDrawerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onEditProfile={handleEditProfile}
        onUpdatePassword={handleUpdatePassword}
      />

      <main className="flex-1">
        <HeroSection
          onSignupClick={handleSignupClick}
          onLoginClick={handleLoginClick}
        />
      </main>

      <Footer />

      <AuthDrawer
        isOpen={authDrawerOpen}
        onClose={() => setAuthDrawerOpen(false)}
        initialUserType={authUserType}
        initialFormType={authFormType}
      />
    </div>
  );
}
