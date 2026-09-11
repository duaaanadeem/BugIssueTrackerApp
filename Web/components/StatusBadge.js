'use client';
import React from 'react';

export default function StatusBadge({ status = 'Open' }) {
  const norm = (status || '').toLowerCase().trim();

  let badgeStyle = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
  let dotColor = 'bg-blue-400';

  if (norm.includes('progress')) {
    badgeStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (norm.includes('review')) {
    badgeStyle = 'bg-violet-500/10 text-violet-300 border-violet-500/30';
    dotColor = 'bg-violet-400';
  } else if (norm.includes('resolved') || norm.includes('done') || norm.includes('closed')) {
    badgeStyle = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  }

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
}