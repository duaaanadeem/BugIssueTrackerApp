'use client';
import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <div className="relative flex w-full items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 z-10 flex items-center text-[#656185]">
            <Icon size={18} className="shrink-0" />
          </div>
        )}
        <input
          id={id}
          className={`h-11 w-full rounded-xl border border-[#2b264a] bg-[#121020] text-sm font-normal text-[#f5f6fa] placeholder-[#656185] transition outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 ${
            Icon ? 'pr-4 pl-11' : 'px-4'
          } ${error ? 'border-red-500/80' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-0.5 text-xs text-red-400">{error}</span>}
    </div>
  );
}
