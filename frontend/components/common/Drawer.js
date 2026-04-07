'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { usePathname } from 'next/navigation';

export default function Drawer({ isOpen, onClose, title, children, persistKey, disablePersistence = false }) {
  const pathname = usePathname();
  const [persistedOpen, setPersistedOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const storageKey = useMemo(
    () => `drawer:open:${persistKey || `${pathname || 'global'}:${title || 'drawer'}`}`,
    [persistKey, pathname, title]
  );

  useEffect(() => {
    if (disablePersistence) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPersistedOpen(false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHydrated(true);
      return;
    }

    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersistedOpen(saved === '1');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, [disablePersistence, storageKey]);

  const effectiveIsOpen = disablePersistence ? isOpen : isOpen || persistedOpen;

  useEffect(() => {
    if (!isHydrated || disablePersistence) return;

    if (effectiveIsOpen) {
      localStorage.setItem(storageKey, '1');
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [disablePersistence, effectiveIsOpen, isHydrated, storageKey]);

  const handleClose = () => {
    if (!disablePersistence) {
      setPersistedOpen(false);
      localStorage.removeItem(storageKey);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {effectiveIsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/80 bg-white/88 shadow-2xl shadow-slate-900/20 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-md">
              <h2 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent">{title}</h2>
              <button
                onClick={handleClose}
                className="rounded-xl border border-transparent p-2.5 text-slate-500 transition-colors duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-7 sm:p-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
