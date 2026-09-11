'use client';
import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl select-none cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-600/25 border border-violet-400/20',
    secondary: 'bg-[#18152b] hover:bg-[#201c38] text-[#f5f6fa] border border-[#2b264a]',
    ghost: 'bg-transparent hover:bg-[#18152b] text-[#9fa1b8] hover:text-[#f5f6fa]',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-9',
    md: 'px-4 py-2.5 text-sm gap-2 h-11',
    lg: 'px-5 py-3 text-sm gap-2.5 h-12',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="mr-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon size={18} className="shrink-0" />
      ) : null}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
