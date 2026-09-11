'use client';
import React from 'react';

export default function ChipGroup({ label, options = [], selected, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <span className="text-[11px] font-medium text-[#9094a0]">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          const isSelected = selected === val;

          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300'
                  : 'bg-[#16171b] border-[#23252a] text-[#9094a0] hover:text-[#e6e8ec] hover:border-[#2f323a]'
              }`}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}