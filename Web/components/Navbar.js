"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, onMenu }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="row">
        <button className="menu-btn" type="button" onClick={onMenu}>
          ☰
        </button>
        <h1>{title}</h1>
      </div>
      <Link href="/profile" className="avatar" aria-label="Profile">
        {(user?.name || "U").charAt(0).toUpperCase()}
      </Link>
    </header>
  );
}
