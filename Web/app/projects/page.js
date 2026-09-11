'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import ProjectCard from '../../components/ProjectCard';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { apiService } from '../../services/api';
import { Plus, FolderKanban, Layers, Rocket } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await apiService.getProjects();
        setProjects(Array.isArray(data) ? data : data?.projects || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#211c3a] pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">Project Workspaces</h1>
            <p className="mt-1 text-[13px] text-[#9fa1b8]">
              Manage delivery groups, repositories, and component scopes
            </p>
          </div>
          <Link href="/projects/create">
            <Button variant="primary" icon={Plus} size="lg">
              New Project
            </Button>
          </Link>
        </div>

        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#272242] bg-[#151324] p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-600/20 text-violet-400">
              <FolderKanban size={20} className="shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#656185] uppercase">Total Projects</p>
              <h3 className="text-xl font-bold text-[#f5f6fa]">{projects.length}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-[#272242] bg-[#151324] p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-600/20 text-emerald-400">
              <Layers size={20} className="shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#656185] uppercase">Operational Health</p>
              <h3 className="text-xl font-bold text-emerald-400">100% Online</h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-[#272242] bg-[#151324] p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 text-indigo-400">
              <Rocket size={20} className="shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#656185] uppercase">Deployment</p>
              <h3 className="text-xl font-bold text-indigo-400">Production</h3>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#272242] bg-[#151324] py-20 text-center">
            <FolderKanban size={32} className="mx-auto mb-2 shrink-0 text-[#656185]" />
            <p className="text-sm font-semibold text-[#f5f6fa]">No projects found</p>
            <p className="mt-1 text-[13px] text-[#656185]">Create your first workspace to start assigning tickets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id || p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
