'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

export default function Drawer({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-md">
              <h2 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-xl p-2.5 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
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
