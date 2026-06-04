import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  isLoading?: boolean;
}

export default function Button({ children, variant = 'primary', className = '', isLoading = false, disabled, ...props }: ButtonProps) {
  let baseStyles = 'px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2';

  if (variant === 'primary') {
    baseStyles += ' bg-amber-500 hover:bg-amber-600 text-[#0F172A] shadow-lg shadow-amber-500/10 disabled:bg-amber-500/50';
  } else if (variant === 'secondary') {
    baseStyles += ' bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:bg-slate-800/50';
  } else if (variant === 'danger') {
    baseStyles += ' bg-red-650 hover:bg-red-700 text-white disabled:bg-red-650/50';
  }

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseStyles} disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
      disabled={isBtnDisabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
