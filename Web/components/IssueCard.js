'use client';
import React from 'react';
import Link from 'next/link';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { User, ChevronRight } from 'lucide-react';

export default function IssueCard({ issue }) {
  const id = issue._id || issue.id;
  const identifier = issue.identifier || `ISS-${id?.slice(-4)?.toUpperCase() || '00'}`;
  const projectName = issue.projectId?.name || issue.project?.name || issue.projectName || 'General Workspace';
  const assigneeName = issue.assignedTo?.name || issue.assignee || 'Unassigned';

  return (
    <Link
      href={`/issues/${id}`}
      className="group flex flex-col justify-between gap-4 px-5 py-4 transition hover:bg-[#201c38] sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="w-20 shrink-0 font-mono text-xs font-bold text-violet-400 group-hover:text-violet-300">
          {identifier}
        </span>
        <div className="shrink-0">
          <StatusBadge status={issue.status} />
        </div>
        <span className="truncate text-sm font-medium text-[#f5f6fa] group-hover:text-white">
          {issue.title}
        </span>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-5 text-sm text-[#9fa1b8] sm:justify-end">
        <span className="shrink-0 rounded-lg border border-[#2b264a] bg-[#121020] px-3 py-1 text-xs font-medium text-violet-300">
          {projectName}
        </span>
        <div className="shrink-0">
          <PriorityBadge priority={issue.priority} />
        </div>
        <div className="flex min-w-[120px] shrink-0 items-center gap-2 text-xs text-[#656185]">
          <User size={14} className="shrink-0" />
          <span className="truncate">{assigneeName}</span>
        </div>
        <ChevronRight size={18} className="shrink-0 text-[#656185] transition group-hover:text-violet-400" />
      </div>
    </Link>
  );
}
