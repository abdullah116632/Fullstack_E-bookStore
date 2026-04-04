'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoMenu, IoClose, IoLogOut } from 'react-icons/io5';
import { FaBook } from 'react-icons/fa';
import Button from '@/components/common/Button';
import ProfileDropdown from '@/components/common/ProfileDropdown';
import { logout } from '@/store/slices/authSlice';

export default function Navbar({ 
  onLoginClick, 
  onSignupClick, 
  onEditProfile, 
  onUpdatePassword 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-teal-600 to-cyan-600 p-2.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-500/30">
              <FaBook className="text-white text-xl" />
            </div>
            <div className="hidden sm:block">
              <div className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">EBook</div>
              <div className="text-xs font-medium text-slate-500">Marketplace</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <ProfileDropdown 
                onEditProfile={onEditProfile}
                onUpdatePassword={onUpdatePassword}
              />
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoginClick}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSignupClick}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2.5 text-slate-700 transition-colors duration-300 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 pb-6 md:hidden"
          >
            {isAuthenticated ? (
              <>
                <div className="my-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
                  <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs font-medium capitalize text-slate-500">{userType}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full gap-2"
                >
                  <IoLogOut />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mb-3"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onSignupClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
