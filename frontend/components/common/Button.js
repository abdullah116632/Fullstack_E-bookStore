'use client';

import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-linear-to-r from-teal-600 to-cyan-600 text-white hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 focus:ring-teal-300',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:shadow-md focus:ring-slate-200',
    outline: 'border-2 border-teal-600 text-teal-700 bg-transparent hover:bg-teal-50 hover:shadow-lg focus:ring-teal-200',
    danger: 'bg-linear-to-r from-rose-500 to-red-500 text-white hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 focus:ring-rose-300',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  );
}
