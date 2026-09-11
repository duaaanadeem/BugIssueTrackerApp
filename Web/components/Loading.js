'use client';
import React from 'react';

export default function Loading() {
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[#616672]">Loading...</span>
    </div>
  );
}