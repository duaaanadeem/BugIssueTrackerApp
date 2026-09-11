'use client';
import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-[#121316] border border-[#23252a] rounded-lg p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}