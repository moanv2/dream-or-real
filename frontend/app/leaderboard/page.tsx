import Link from "next/link";
import { mockLeaderboard } from "@/lib/mock-leaderboard";

const topEntry = mockLeaderboard[0];
const longestStreak = mockLeaderboard.length
  ? Math.max(...mockLeaderboard.map((entry) => entry.streak))
  : 0;

export default function LeaderboardPage() {
  return (
    <main className="app-page">
      <div className="app-frame">
        <section className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="pt-4">
            <p className="section-kicker">Leaderboard</p>
            <h1 className="section-title mt-5">
              The current hall
              <br />
              of weirdness.
            </h1>
            <p className="section-copy">
              Mock standings for the people who somehow make good decisions in bad
              circumstances.
            </p>

            <div className="mt-8 space-y-4">
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Top player
                </p>
                <p className="mt-3 font-serif text-[2rem] leading-tight text-[var(--text-on-dark)]">
                  {topEntry?.username ?? "Nobody yet"}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  {topEntry ? `${topEntry.score} points so far.` : "Waiting for the first run."}
                </p>
              </div>

              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Longest streak
                </p>
                <p className="mt-3 text-[2.1rem] font-semibold leading-none text-[var(--accent-gold)]">
                  {longestStreak}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  Clean runs in a row.
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
              <p className="meta-label">Demo standings</p>
              <h2 className="mt-3 font-serif text-[2rem] leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                Current ranking
              </h2>
            </div>

            <div className="p-6 lg:p-7">
              {mockLeaderboard.length ? (
                <div className="space-y-3">
                  {mockLeaderboard.map((entry, index) => (
                    <div
                      key={entry.username}
                      className={[
                        "motion-list-enter grid items-center gap-4 rounded-xl border px-5 py-4 md:grid-cols-[72px_minmax(0,1fr)_120px_120px]",
                        entry.rank <= 3
                          ? "border-[rgba(201,168,76,0.26)] bg-[rgba(201,168,76,0.1)]"
                          : "border-[var(--border-card)] bg-[rgba(255,255,255,0.55)]",
                      ].join(" ")}
                      style={{ animationDelay: `${index * 28}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] text-sm font-semibold text-[var(--text-primary)]">
                          #{entry.rank}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                          {entry.username}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {entry.rank <= 3 ? "Top bracket" : "Climbing the board"}
                        </p>
                      </div>

                      <div>
                        <p className="meta-label">Score</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                          {entry.score}
                        </p>
                      </div>

                      <div>
                        <p className="meta-label">Streak</p>
                        <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
                          {entry.streak}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[rgba(107,101,96,0.28)] bg-[var(--bg-card-reveal)] px-6 py-12 text-center">
                  <p className="font-serif text-[1.8rem] leading-tight text-[var(--text-primary)]">
                    No leaderboard entries yet.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Once scores exist, this page will fill in with ranks, streaks, and
                    suspiciously strong dream instincts.
                  </p>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
