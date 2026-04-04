'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLogOut, IoArrowForward, IoKey, IoPerson } from 'react-icons/io5';
import { logout } from '@/store/slices/authSlice';

export default function ProfileDropdown({ onEditProfile, onUpdatePassword }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onEditProfile?.();
  };

  const handlePasswordClick = () => {
    setIsOpen(false);
    onUpdatePassword?.();
  };

  const getInitial = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const menuItems = [
    {
      icon: <IoPerson className="text-lg" />,
      label: 'Edit Profile',
      onClick: handleProfileClick,
    },
    {
      icon: <IoKey className="text-lg" />,
      label: 'Change Password',
      onClick: handlePasswordClick,
    },
    {
      icon: <IoLogOut className="text-lg" />,
      label: 'Logout',
      onClick: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-cyan-600 text-sm font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
        title={user?.fullName}
      >
        {getInitial(user?.fullName)}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-slate-200 px-4 py-3.5">
              <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ backgroundColor: item.isDanger ? '#fef2f2' : '#f8fafc' }}
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    item.isDanger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={item.isDanger ? 'text-red-500' : 'text-slate-600'}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <IoArrowForward className={`text-xs ${item.isDanger ? 'text-red-400' : 'text-slate-400'}`} />
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
              <Link href="/active-book" className="hover:text-teal-700 transition-colors font-medium">
                My Books →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
