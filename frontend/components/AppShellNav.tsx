"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Play" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "Submit" },
];

export function AppShellNav() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[rgba(22,20,18,0.88)] backdrop-blur">
      <div className="app-frame flex h-14 items-center justify-between gap-6 px-6 lg:px-0">
        <Link
          href="/"
          className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark)]">
            Dream or Real
          </span>
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-on-dark-muted)] md:inline">
            Late-night demo
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-md px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]",
                  isActive
                    ? "bg-[rgba(250,246,239,0.06)] text-[var(--text-on-dark)]"
                    : "text-[var(--text-on-dark-muted)] hover:bg-[rgba(250,246,239,0.04)] hover:text-[var(--text-on-dark)]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
