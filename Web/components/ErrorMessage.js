'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs my-2">
      <AlertTriangle size={14} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}