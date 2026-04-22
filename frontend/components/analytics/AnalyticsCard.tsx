import type { ReactNode } from "react";

type AnalyticsCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  muted?: boolean;
};

export function AnalyticsCard({ title, subtitle, children, muted = false }: AnalyticsCardProps) {
  return (
    <section
      className={[
        muted ? "surface-glass-muted" : "surface-glass",
        "flex h-full min-h-[260px] flex-col p-6",
      ].join(" ")}
    >
      <header className="mb-5">
        <h2 className="meta-label">{title}</h2>
        {subtitle ? (
          <p
            className={[
              "mt-1 text-[13px]",
              muted ? "text-[var(--text-on-dark-muted)]" : "text-[var(--text-on-dark-muted)]",
            ].join(" ")}
          >
            {subtitle}
          </p>
        ) : null}
      </header>
      <div className="relative flex flex-1 flex-col justify-center">{children}</div>
    </section>
  );
}
