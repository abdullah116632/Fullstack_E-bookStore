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
  const baseStyles = 'font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

  const variants = {
    primary: 'bg-linear-to-r from-teal-600 via-cyan-600 to-sky-600 text-white shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-500/35 hover:-translate-y-0.5 focus:ring-cyan-300',
    secondary: 'bg-white/95 text-slate-900 border border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-300/35 focus:ring-slate-200',
    outline: 'border-2 border-teal-500/75 text-teal-800 bg-white/60 backdrop-blur-sm hover:bg-teal-50 hover:border-teal-600 hover:shadow-md focus:ring-teal-200',
    danger: 'bg-linear-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/35 hover:-translate-y-0.5 focus:ring-rose-300',
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
