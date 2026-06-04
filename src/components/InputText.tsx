import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function InputText({ label, className = '', ...props }: InputTextProps) {
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm ${className}`}
        {...props}
      />
    </div>
  );
}
