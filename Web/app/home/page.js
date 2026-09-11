'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import IssueCard from '../../components/IssueCard';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  FolderKanban,
  CheckCircle2,
  Flame,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_WEEKS = ['W1', 'W2', 'W3', 'W4'];

function weekdayCounts(issues) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  issues.forEach((issue) => {
    const date = new Date(issue.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;
    const jsDay = date.getDay();
    const index = jsDay === 0 ? 6 : jsDay - 1;
    counts[index] += 1;
  });
  return counts;
}

function monthWeekCounts(issues) {
  const counts = [0, 0, 0, 0];
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  issues.forEach((issue) => {
    const date = new Date(issue.createdAt || Date.now());
    if (Number.isNaN(date.getTime())) return;
    if (date.getMonth() !== month || date.getFullYear() !== year) return;
    const weekIndex = Math.min(3, Math.floor((date.getDate() - 1) / 7));
    counts[weekIndex] += 1;
  });
  return counts;
}

export default function HomePage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('week');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [issuesRes, projectsRes] = await Promise.all([
          apiService.getIssues(),
          apiService.getProjects(),
        ]);
        setIssues(Array.isArray(issuesRes) ? issuesRes : issuesRes?.issues || []);
        setProjects(Array.isArray(projectsRes) ? projectsRes : projectsRes?.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openIssues = issues.filter(
    (i) => i.status?.toLowerCase() !== 'closed' && i.status?.toLowerCase() !== 'resolved'
  );
  const resolvedIssues = issues.filter(
    (i) => i.status?.toLowerCase() === 'closed' || i.status?.toLowerCase() === 'resolved'
  );
  const criticalIssues = issues.filter(
    (i) => i.priority?.toLowerCase() === 'critical' || i.priority?.toLowerCase() === 'high'
  );
  const resolvedPct = issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0;
  const labels = chartRange === 'week' ? WEEKDAYS : MONTH_WEEKS;
  const counts = chartRange === 'week' ? weekdayCounts(issues) : monthWeekCounts(issues);
  const maxCount = Math.max(...counts, 1);
  const greeting = user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Analytics Overview';

  return (
    <AppShell>
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#f5f6fa] sm:text-2xl">{greeting}</h1>
            <p className="mt-1 text-[13px] text-[#9fa1b8]">
              Real-time workspace telemetry and workload tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/projects/create">
              <Button variant="secondary">New Project</Button>
            </Link>
            <Link href="/issues/create">
              <Button variant="primary" icon={Plus}>
                Create Issue
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Active Issues',
              value: openIssues.length,
              href: '/issues?status=Active',
              icon: AlertCircle,
              iconWrap: 'bg-violet-600/20 text-violet-400 border-violet-500/30',
              badge: 'Active',
              badgeWrap: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              bar: 'from-violet-600 to-fuchsia-400',
            },
            {
              label: 'Total Projects',
              value: projects.length,
              href: '/projects',
              icon: FolderKanban,
              iconWrap: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
              badge: 'Workspaces',
              badgeWrap: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              bar: 'from-indigo-600 to-violet-400',
            },
            {
              label: 'Completed',
              value: resolvedIssues.length,
              href: '/issues?status=Resolved',
              icon: CheckCircle2,
              iconWrap: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
              badge: 'Resolved',
              badgeWrap: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              bar: 'from-emerald-600 to-teal-400',
            },
            {
              label: 'Critical Severity',
              value: criticalIssues.length,
              href: '/issues?priority=Critical',
              icon: Flame,
              iconWrap: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
              badge: 'Urgent',
              badgeWrap: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
              bar: 'from-rose-600 to-orange-400',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                href={card.href}
                key={card.label}
                className="flex min-h-[148px] flex-col justify-between rounded-2xl border border-[#272242] bg-[#18152b] p-5 shadow-sm transition hover:border-violet-500/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${card.iconWrap}`}>
                    <Icon size={18} className="shrink-0" />
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${card.badgeWrap}`}>
                    {card.badge === 'Active' && <TrendingUp size={12} className="shrink-0" />}
                    {card.badge}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold tracking-wider text-[#656185] uppercase">{card.label}</p>
                  <h2 className="mt-1 text-[28px] leading-none font-bold text-[#f5f6fa]">{card.value}</h2>
                  <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${card.bar} opacity-80`} />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="flex min-h-[340px] flex-col justify-between rounded-2xl border border-[#272242] bg-[#18152b] p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#f5f6fa]">Workload Distribution</h3>
                <p className="mt-0.5 text-[13px] text-[#656185]">Issue throughput across standard cycles</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#272242] bg-[#121020] p-1">
                <button
                  type="button"
                  onClick={() => setChartRange('week')}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    chartRange === 'week'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'text-[#656185] hover:text-[#f5f6fa]'
                  }`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange('month')}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    chartRange === 'month'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'text-[#656185] hover:text-[#f5f6fa]'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="flex h-56 w-full items-end justify-between gap-3 px-2 pt-4">
              {labels.map((day, index) => {
                const value = counts[index];
                const height = `${Math.max(18, Math.round((value / maxCount) * 100))}%`;
                const active = value === maxCount && value > 0;
                return (
                  <div key={day} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[11px] text-[#9fa1b8] opacity-0 transition group-hover:opacity-100">
                      {value}
                    </span>
                    <div
                      style={{ height }}
                      className={`w-full max-w-[48px] rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-t from-violet-700 via-purple-600 to-fuchsia-400 shadow-lg shadow-purple-600/40'
                          : 'bg-[#23203c] group-hover:bg-violet-600/40'
                      }`}
                    />
                    <span className="text-xs font-medium text-[#656185]">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[340px] flex-col justify-between rounded-2xl border border-[#272242] bg-[#18152b] p-6">
            <div>
              <h3 className="text-base font-semibold text-[#f5f6fa]">Resolution Efficiency</h3>
              <p className="mt-0.5 text-[13px] text-[#656185]">Closed vs open ratio</p>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <div className="h-full w-full rounded-full border-8 border-[#231f3c]" />
                <div className="absolute inset-0 rotate-45 rounded-full border-8 border-violet-500 border-t-fuchsia-400 border-r-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-white">{resolvedPct}%</span>
                  <p className="text-[11px] tracking-wider text-[#656185] uppercase">Solved</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-[#231f3c] pt-4 text-sm">
              <div className="flex justify-between text-[#9fa1b8]">
                <span>Total Tracked</span>
                <span className="font-semibold text-[#f5f6fa]">{issues.length}</span>
              </div>
              <div className="flex justify-between text-[#9fa1b8]">
                <span>Pending Action</span>
                <span className="font-semibold text-amber-400">{openIssues.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#f5f6fa]">Recent Activity & Issues</h3>
            <Link href="/issues" className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300">
              <span>View all issues</span>
              <ArrowUpRight size={16} className="shrink-0" />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : issues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#272242] bg-[#18152b]/40 py-16 text-center">
              <p className="text-sm font-medium text-[#f5f6fa]">No issues filed yet</p>
              <p className="mt-1 text-[13px] text-[#656185]">Use the Create Issue button to submit tasks.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#272242] bg-[#18152b]">
              <div className="divide-y divide-[#231f3c]">
                {issues.slice(0, 6).map((issue) => (
                  <IssueCard key={issue._id || issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
