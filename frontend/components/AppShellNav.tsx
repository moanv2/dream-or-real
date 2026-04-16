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

  return (
    <header className="sticky top-0 z-40 px-6 pt-5 lg:px-8">
      <div className="app-frame flex items-center justify-between rounded-[1.75rem] border border-white/80 bg-white/82 px-5 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-full transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold tracking-tight text-white shadow-sm">
            D/R
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-ink">Dream or Real</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Hackathon Demo</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/88 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2",
                  isActive
                    ? "bg-white text-ink shadow-sm"
                    : "text-slate-500 hover:-translate-y-0.5 hover:bg-white/70 hover:text-ink",
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
