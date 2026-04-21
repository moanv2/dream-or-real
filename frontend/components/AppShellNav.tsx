"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Play" },
  { href: "/submit", label: "Submit" },
];

export function AppShellNav() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border-subtle)] bg-[rgba(22,20,18,0.85)] px-8 backdrop-blur lg:px-12">
      <div className="justify-self-start">
        <Link
          href="/"
          className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark)]">
            Dream or Real
          </span>
        </Link>
      </div>

      <nav className="justify-self-center flex items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-md px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]",
                isActive
                  ? "bg-[rgba(250,246,239,0.08)] text-[var(--text-on-dark)]"
                  : "text-[var(--text-on-dark-muted)] hover:bg-[rgba(250,246,239,0.04)] hover:text-[var(--text-on-dark)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="justify-self-end w-[160px]" aria-hidden="true" />
    </header>
  );
}
