'use client';
import React, { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { User, Mail, FolderKanban } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await apiService.getProjects();
        setProjects(Array.isArray(data) ? data : data?.projects || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadProjects();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiService.updateProfile({ name });
      setToastMessage('Profile updated successfully');
    } catch (err) {
      setToastMessage(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="border-b border-[#211c3a] pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#f5f6fa]">Account</h1>
          <p className="mt-1 text-[13px] text-[#9fa1b8]">Update your display name and review your projects</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleUpdate}
            className="space-y-6 rounded-2xl border border-[#272242] bg-[#151324] p-6 shadow-xl sm:p-8 lg:col-span-2"
          >
            <div className="flex items-center gap-5 border-b border-[#1e1a33] pb-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-2xl font-bold text-white shadow-lg shadow-violet-600/30">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-[#f5f6fa]">{user?.name || 'Developer'}</h2>
                <p className="mt-0.5 text-[13px] text-[#9fa1b8]">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                id="name"
                label="Display Name"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                id="email"
                label="Email"
                icon={Mail}
                value={user?.email || ''}
                disabled
                className="cursor-not-allowed bg-[#100e1c] opacity-60"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#1e1a33] pt-4">
              <Button type="button" variant="danger" onClick={logout}>
                Log out
              </Button>
              <Button type="submit" variant="primary" size="lg" loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>

          <div className="rounded-2xl border border-[#272242] bg-[#151324] p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FolderKanban size={18} className="shrink-0 text-violet-400" />
                <h3 className="text-sm font-bold text-[#f5f6fa]">My Projects</h3>
              </div>
              <span className="text-xs text-[#656185]">{projects.length}</span>
            </div>

            {projects.length === 0 ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[#9fa1b8]">You have not joined any projects yet.</p>
                <Link href="/projects/create">
                  <Button variant="primary" className="w-full">
                    Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 8).map((project) => {
                  const id = project._id || project.id;
                  const memberCount = Array.isArray(project.members) ? project.members.length : 0;
                  return (
                    <Link
                      key={id}
                      href={`/projects/${id}`}
                      className="block rounded-xl border border-[#272242] bg-[#1b182d] px-3 py-3 hover:border-violet-500/40"
                    >
                      <p className="truncate text-sm font-semibold text-[#f5f6fa]">{project.name}</p>
                      <p className="mt-0.5 text-xs text-[#656185]">
                        {memberCount} member{memberCount === 1 ? '' : 's'}
                      </p>
                    </Link>
                  );
                })}
                <Link href="/projects" className="block pt-2 text-sm font-medium text-violet-400 hover:text-violet-300">
                  View all projects
                </Link>
              </div>
            )}
          </div>
        </div>

        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </div>
    </AppShell>
  );
}
