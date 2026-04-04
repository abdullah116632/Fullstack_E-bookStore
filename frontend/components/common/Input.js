'use client';

import clsx from 'clsx';

export default function Input({
  label,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={clsx(
          'w-full rounded-xl border px-4 py-3 transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'placeholder-slate-400 text-slate-800 font-medium',
          'hover:border-slate-300',
          error 
            ? 'border-red-400 bg-red-50/70 focus:border-red-500 focus:ring-red-100' 
            : 'border-slate-200 bg-white/95 focus:border-teal-500 focus:ring-teal-100',
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

