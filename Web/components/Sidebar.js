'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, AlertCircle, User, LogOut, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/home', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Issues', href: '/issues', icon: AlertCircle },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href) => pathname === href || (href !== '/home' && pathname.startsWith(href));

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#211c3a] bg-[#121020] transition-transform duration-200 ease-in-out md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-8 flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25">
                <Sparkles size={18} className="shrink-0" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base leading-none font-bold tracking-tight text-[#f5f6fa]">BugTracker</h1>
                <p className="mt-1 text-[11px] font-medium tracking-wider text-[#656185] uppercase">
                  Analytics Engine
                </p>
              </div>
            </div>

            <Link href="/issues/create" onClick={() => onClose?.()} className="mb-6 block">
              <div className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-[#18152b] px-4 text-sm font-semibold text-violet-300 shadow-sm transition hover:bg-[#201c38]">
                <Plus size={16} className="shrink-0" />
                <span>New Issue</span>
              </div>
            </Link>

            <div className="space-y-1.5">
              <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-[#656185] uppercase">Main Menu</p>
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => onClose?.()}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-600/30'
                        : 'text-[#9fa1b8] hover:bg-[#18152b] hover:text-[#f5f6fa]'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-b from-[#211b3e] to-[#151324] p-4">
              <p className="text-sm font-semibold text-[#f5f6fa]">Workspace</p>
              <p className="mt-1 text-xs leading-relaxed text-[#9fa1b8]">
                Track issues, projects, and resolution metrics in one place.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#211c3a] px-1 pt-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-600/30 text-sm font-bold text-violet-300">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f5f6fa]">{user?.name || 'Developer'}</p>
                  <p className="truncate text-xs text-[#656185]">{user?.email || 'Active'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="shrink-0 cursor-pointer rounded-lg p-2 text-[#656185] transition hover:bg-[#18152b] hover:text-red-400"
              >
                <LogOut size={18} className="shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
