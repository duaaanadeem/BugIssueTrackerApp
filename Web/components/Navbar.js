'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const next = query.trim();
    router.push(next ? `/issues?q=${encodeURIComponent(next)}` : '/issues');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#211c3a] bg-[#121020]/80 px-6 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="shrink-0 cursor-pointer rounded-lg p-2 text-[#9fa1b8] hover:bg-[#18152b] hover:text-[#f5f6fa] md:hidden"
        >
          <Menu size={20} className="shrink-0" />
        </button>

        <form onSubmit={handleSearch} className="relative flex w-full max-w-xl items-center">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 z-10 shrink-0 text-[#656185]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, then press Enter..."
            className="h-11 w-full rounded-xl border border-[#2b264a] bg-[#18152b] pl-11 pr-4 text-sm text-[#f5f6fa] placeholder-[#656185] outline-none transition focus:border-violet-500"
          />
        </form>
      </div>

      <Link href="/profile" className="flex shrink-0 items-center gap-3 pl-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm leading-none font-semibold text-[#f5f6fa]">{user?.name || 'User'}</p>
          <p className="mt-1 text-xs text-[#656185]">Workspace Member</p>
        </div>
      </Link>
    </header>
  );
}
