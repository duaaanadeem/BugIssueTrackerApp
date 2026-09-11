"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="shell-main">
        <Navbar title={title} onMenu={() => setMenuOpen(true)} />
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
