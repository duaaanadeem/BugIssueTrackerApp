'use client';
import React from 'react';
import Link from 'next/link';
import { FolderKanban, Calendar, ArrowUpRight } from 'lucide-react';

export default function ProjectCard({ project }) {
  const id = project._id || project.id;
  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString()
    : 'Recent';

  return (
    <Link
      href={`/projects/${id}`}
      className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-[#272242] bg-[#151324] p-6 shadow-md transition duration-200 hover:border-violet-500/40 hover:bg-[#1c1930]"
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl border border-violet-500/30 bg-violet-600/20 p-2.5 text-violet-400">
              <FolderKanban size={18} className="shrink-0" />
            </div>
            <h3 className="truncate text-base font-bold text-[#f5f6fa] group-hover:text-white">
              {project.name}
            </h3>
          </div>
          <ArrowUpRight size={18} className="shrink-0 text-[#656185] transition group-hover:text-violet-400" />
        </div>
        <p className="mb-6 line-clamp-2 text-[13px] leading-relaxed text-[#9fa1b8]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[#211c3a] pt-4 text-xs text-[#656185]">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <span className="rounded-full border border-[#272242] bg-[#100e1c] px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
          Active
        </span>
      </div>
    </Link>
  );
}
