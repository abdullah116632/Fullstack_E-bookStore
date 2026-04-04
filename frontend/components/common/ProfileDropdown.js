'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLogOut, IoArrowForward, IoKey, IoPerson, IoMail } from 'react-icons/io5';
import { logout } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileDropdown({ onEditProfile, onUpdatePassword, onChangeEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    sessionStorage.setItem('intentionalLogout', '1');
    dispatch(logout());
    setIsOpen(false);
    router.push('/');
  };

  const handleProfileClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsOpen(false);
    setTimeout(() => {
      onEditProfile?.();
    }, 0);
  };

  const handlePasswordClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsOpen(false);
    setTimeout(() => {
      onUpdatePassword?.();
    }, 0);
  };

  const handleEmailClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsOpen(false);
    setTimeout(() => {
      onChangeEmail?.();
    }, 0);
  };

  const getInitial = (name) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const menuItems = [
    {
      icon: <IoPerson className="text-lg" />,
      label: t('profileDropdown.editProfile'),
      onClick: handleProfileClick,
    },
    {
      icon: <IoMail className="text-lg" />,
      label: t('profileDropdown.changeEmail'),
      onClick: handleEmailClick,
    },
    {
      icon: <IoKey className="text-lg" />,
      label: t('profileDropdown.changePassword'),
      onClick: handlePasswordClick,
    },
    {
      icon: <IoLogOut className="text-lg" />,
      label: t('profileDropdown.logout'),
      onClick: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
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
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header */}
            <div className="border-b border-slate-200 px-4 py-3.5">
              <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => item.onClick?.(e)}
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
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
              <p className="text-center italic">Profile Settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
