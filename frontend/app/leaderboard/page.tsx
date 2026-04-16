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
        <div className="mb-7 flex items-end justify-between gap-6">
          <div className="max-w-[46rem]">
            <p className="section-kicker mb-4 transition-transform duration-300 hover:-translate-y-0.5">
              Leaderboard
            </p>
            <h1 className="section-title">
              The current hall of weirdness.
            </h1>
            <p className="section-copy">
              Mock rankings for the sharpest dream detectives. Fast to scan, easy to swap out later.
            </p>
          </div>

          <Link href="/" className="button-secondary py-2.5">
            Back to Game
          </Link>
        </div>

        <section className="motion-card-enter surface-card overflow-hidden">
          <div className="grid lg:grid-cols-[0.84fr_1.16fr]">
            <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
              <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                Demo Standings
              </span>
              <h2 className="mt-5 text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3rem]">
                High scores, suspicious instincts, and a little fake glory.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                The leaderboard stays secondary to the game, but it gives the demo a stronger sense of momentum and replayability.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="motion-panel-enter panel-soft border-0 bg-white p-6 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="meta-label">
                    Top Player
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
                    {topEntry?.username ?? "Nobody yet"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {topEntry ? `${topEntry.score} points` : "Waiting for the first run"}
                  </p>
                </div>
                <div className="motion-panel-enter rounded-[1.75rem] bg-ink p-6 text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Longest Streak
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    {longestStreak}
                  </p>
                  <p className="mt-2 text-sm text-white/70">games in a row</p>
                </div>
              </div>

              <div className="panel-soft mt-8 border-white/80 p-6">
                <p className="meta-label">
                  Format
                </p>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Score reflects total points. Streak tracks consecutive wins. Everything here is local mock data for the demo.
                </p>
              </div>
            </div>

            <div className="p-9 lg:p-11">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Top 10
                  </p>
                  <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-ink">
                    Current ranking
                  </h3>
                </div>
                <span className="chip-soft transition-transform duration-300 hover:-translate-y-0.5">
                  mock only
                </span>
              </div>

              <div className="space-y-3">
                {mockLeaderboard.length ? (
                  mockLeaderboard.map((entry, index) => (
                    <div
                      key={entry.username}
                      className={[
                        "motion-list-enter rounded-[1.5rem] border px-5 py-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                        entry.rank <= 3
                          ? "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,248,238,0.98)_0%,rgba(255,255,255,0.92)_100%)]"
                          : "border-slate-200/90 bg-white/85",
                      ].join(" ")}
                      style={{ animationDelay: `${index * 28}ms` }}
                    >
                      <div className="grid items-center gap-4 md:grid-cols-[72px_minmax(0,1fr)_120px_110px]">
                        <div className="flex items-center gap-3">
                          <span className={[
                            "inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold tracking-tight",
                            entry.rank === 1
                              ? "bg-amber-100 text-amber-700"
                              : entry.rank === 2
                                ? "bg-slate-200 text-slate-700"
                                : entry.rank === 3
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-600",
                          ].join(" ")}>
                            #{entry.rank}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold tracking-tight text-ink">
                            {entry.username}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {entry.rank <= 3 ? "Top bracket" : "Climbing the board"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Score
                          </p>
                          <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
                            {entry.score}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Streak
                          </p>
                          <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-ink">
                            {entry.streak}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="motion-panel-enter rounded-[1.75rem] border border-dashed border-slate-300 bg-white/82 px-6 py-10 text-center shadow-sm">
                    <p className="text-lg font-semibold tracking-tight text-ink">
                      No leaderboard entries yet.
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Once scores exist, this page will fill in with ranks, streaks,
                      and suspiciously strong dream instincts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
