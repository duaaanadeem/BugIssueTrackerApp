'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-dvh w-full overflow-hidden bg-[#0c0b14] text-[#f5f6fa]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-[#0c0b14]">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
