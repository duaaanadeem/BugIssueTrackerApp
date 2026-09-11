'use client';
import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3 py-2 rounded-md bg-[#18191d] border border-[#272a31] text-xs text-[#e6e8ec] shadow-lg animate-in fade-in slide-in-from-bottom-2">
      {type === 'success' ? (
        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle size={15} className="text-red-400 shrink-0" />
      )}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-[#616672] hover:text-[#e6e8ec]">
          <X size={13} />
        </button>
      )}
    </div>
  );
}