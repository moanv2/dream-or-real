import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <main className="app-page">
      <div className="app-frame">
        <section className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="pt-4">
            <p className="section-kicker">Leaderboard</p>
            <h1 className="section-title mt-5">
              The score page is
              <br />
              still a prop.
            </h1>
            <p className="section-copy">
              The MVP keeps score on the home screen only. No accounts, no shared ranking,
              and no fake backend logic.
            </p>

            <div className="mt-8 space-y-4">
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  What exists
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  Random story fetch, guess, reveal, and anonymous submission all run
                  against the backend.
                </p>
              </div>

              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  What does not
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  No global ranking, no sign-in, and no attempt to police duplicate plays.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/" className="button-secondary">
                Back to play
              </Link>
            </div>
          </div>

          <section className="motion-card-enter surface-card">
            <div className="border-b border-[var(--border-card)] px-8 py-7 lg:px-10">
              <p className="meta-label">Demo note</p>
              <h2 className="mt-3 font-serif text-[2rem] leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                Deliberately not implemented
              </h2>
            </div>

            <div className="p-6 lg:p-7">
              <div className="rounded-xl border border-dashed border-[rgba(107,101,96,0.28)] bg-[var(--bg-card-reveal)] px-6 py-12 text-center">
                <p className="font-serif text-[1.8rem] leading-tight text-[var(--text-primary)]">
                  Keep score in the room.
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  This page stays intentionally lightweight so the MVP stays focused on
                  the actual game loop and submission flow.
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
