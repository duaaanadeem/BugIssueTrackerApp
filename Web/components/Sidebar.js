"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "/home", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/issues", label: "Issues" },
  { href: "/profile", label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {open ? <div className="overlay" onClick={onClose} /> : null}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="logo">BI</div>

          <div>
            <div className="sidebar-title">Bug & Issue Tracker</div>
          </div>
        </div>

        <nav>
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${active ? "active" : ""}`}
                onClick={onClose}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn btn-danger btn-block"
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}