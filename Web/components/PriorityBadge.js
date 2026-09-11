'use client';
import React from 'react';
import { AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function PriorityBadge({ priority = 'Low' }) {
  const norm = (priority || '').toLowerCase().trim();

  let color = 'text-zinc-400';
  let Icon = Minus;

  if (norm === 'critical' || norm === 'urgent') {
    color = 'text-rose-400';
    Icon = AlertCircle;
  } else if (norm === 'high') {
    color = 'text-orange-400';
    Icon = ArrowUp;
  } else if (norm === 'medium') {
    color = 'text-amber-400';
    Icon = ArrowUp;
  } else if (norm === 'low') {
    color = 'text-zinc-400';
    Icon = ArrowDown;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${color}`}>
      <Icon size={14} strokeWidth={2.5} className="shrink-0" />
      <span className="capitalize">{priority}</span>
    </span>
  );
}