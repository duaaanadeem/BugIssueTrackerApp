'use client';
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../components/AppShell';
import IssueCard from '../../components/IssueCard';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { apiService } from '../../services/api';
import { Plus, Search, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function IssuesPage() {
  return (
    <Suspense fallback={<AppShell><Loading /></AppShell>}>
      <IssuesPageContent />
    </Suspense>
  );
}

function IssuesPageContent() {
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All');

  useEffect(() => {
    async function loadIssues() {
      try {
        setLoading(true);
        const data = await apiService.getIssues();
        setIssues(Array.isArray(data) ? data : data?.issues || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setStatusFilter(searchParams.get('status') || 'All');
    setPriorityFilter(searchParams.get('priority') || 'All');
  }, [searchParams]);

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(search.toLowerCase()) ||
      issue.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' &&
        issue.status?.toLowerCase() !== 'resolved' &&
        issue.status?.toLowerCase() !== 'closed') ||
      issue.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === 'All' ||
      (priorityFilter === 'Critical' &&
        (issue.priority?.toLowerCase() === 'high' || issue.priority?.toLowerCase() === 'critical')) ||
      issue.priority?.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = issues.filter(
    (i) => i.status?.toLowerCase() !== 'resolved' && i.status?.toLowerCase() !== 'closed'
  ).length;
  const highCount = issues.filter(
    (i) => i.priority?.toLowerCase() === 'high' || i.priority?.toLowerCase() === 'critical'
  ).length;
  const inProgress = issues.filter((i) => i.status?.toLowerCase().includes('progress')).length;
  const inReview = issues.filter((i) => i.status?.toLowerCase().includes('review')).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#211c3a] pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">Issue Repository</h1>
            <p className="mt-1 text-[13px] text-[#9fa1b8]">
              Inspect, filter, and triage tickets across active projects
            </p>
          </div>
          <Link href="/issues/create">
            <Button variant="primary" icon={Plus} size="lg">
              Create Issue
            </Button>
          </Link>
        </div>

        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-[#272242] bg-[#151324] p-4 sm:flex-row sm:items-center">
              <div className="w-full sm:max-w-md">
                <Input
                  icon={Search}
                  placeholder="Search issues by title, details..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex w-full items-center gap-3 sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="field-select min-w-[150px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="field-select min-w-[150px]"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {loading ? (
              <Loading />
            ) : filteredIssues.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#272242] bg-[#151324] py-24 text-center">
                <AlertCircle size={32} className="mx-auto mb-2 shrink-0 text-[#656185]" />
                <p className="text-sm font-semibold text-[#f5f6fa]">No issues found</p>
                <p className="mt-1 text-[13px] text-[#656185]">Try resetting filters or file a new issue.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e1a33] overflow-hidden rounded-2xl border border-[#272242] bg-[#151324] shadow-lg">
                {filteredIssues.map((issue) => (
                  <IssueCard key={issue._id || issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl border border-[#272242] bg-[#151324] p-5">
              <h3 className="text-xs font-bold tracking-wider text-[#656185] uppercase">Queue Metrics</h3>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setStatusFilter('Active')}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#272242] bg-[#1b182d] p-3.5 text-left hover:border-violet-500/40"
                >
                  <div className="flex items-center gap-2.5 text-sm text-[#9fa1b8]">
                    <Clock size={16} className="shrink-0 text-amber-400" />
                    <span>Open queue</span>
                  </div>
                  <span className="text-base font-bold text-[#f5f6fa]">{openCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityFilter('Critical')}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#272242] bg-[#1b182d] p-3.5 text-left hover:border-violet-500/40"
                >
                  <div className="flex items-center gap-2.5 text-sm text-[#9fa1b8]">
                    <AlertCircle size={16} className="shrink-0 text-rose-400" />
                    <span>Urgent / Critical</span>
                  </div>
                  <span className="text-base font-bold text-rose-400">{highCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Resolved')}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#272242] bg-[#1b182d] p-3.5 text-left hover:border-violet-500/40"
                >
                  <div className="flex items-center gap-2.5 text-sm text-[#9fa1b8]">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Resolved</span>
                  </div>
                  <span className="text-base font-bold text-emerald-400">{issues.length - openCount}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#272242] bg-[#151324] p-5">
              <h3 className="text-xs font-bold tracking-wider text-[#656185] uppercase">Filter Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#9fa1b8]">
                  <span>Showing</span>
                  <span className="font-semibold text-[#f5f6fa]">{filteredIssues.length}</span>
                </div>
                <div className="flex justify-between text-[#9fa1b8]">
                  <span>In Progress</span>
                  <span className="font-semibold text-amber-300">{inProgress}</span>
                </div>
                <div className="flex justify-between text-[#9fa1b8]">
                  <span>In Review</span>
                  <span className="font-semibold text-violet-300">{inReview}</span>
                </div>
                <div className="flex justify-between text-[#9fa1b8]">
                  <span>Total filed</span>
                  <span className="font-semibold text-[#f5f6fa]">{issues.length}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-b from-[#211b3e] to-[#151324] p-5">
              <div className="mb-2 flex items-center gap-2 text-violet-300">
                <Sparkles size={16} className="shrink-0" />
                <span className="text-xs font-bold tracking-wider uppercase">Workspace tip</span>
              </div>
              <p className="mb-4 text-[13px] leading-relaxed text-[#9fa1b8]">
                Group tickets into projects so filters and resolution stats stay accurate.
              </p>
              <Link href="/projects/create">
                <Button variant="primary" className="w-full">
                  New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
