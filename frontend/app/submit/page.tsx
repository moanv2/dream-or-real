import Link from "next/link";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-mist px-6 py-10 text-ink lg:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 max-w-[44rem]">
          <p className="mb-4 inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
            Submit
          </p>
          <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3.7rem]">
            Story submissions come next.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            This placeholder keeps the shell complete for the demo. Later, this page can become the form where players send in their strangest true stories or dream fragments.
          </p>
        </div>

        <section className="motion-card-enter overflow-hidden rounded-4xl border border-white/80 bg-paper/95 shadow-card backdrop-blur">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
              <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                Placeholder
              </span>
              <h2 className="mt-5 text-[2.25rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[2.9rem]">
                Keep the demo feeling complete without adding backend work.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Right now this is just a clean holding page. It tells the story of where the product grows next without pretending the feature is implemented.
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-white/80 bg-white/82 p-6 shadow-sm backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Future Inputs
                </p>
                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-100/85 px-4 py-3">Story title</div>
                  <div className="rounded-2xl bg-slate-100/85 px-4 py-3">Short summary</div>
                  <div className="rounded-2xl bg-slate-100/85 px-4 py-3">Dream or real reveal</div>
                </div>
              </div>
            </div>

            <div className="p-9 lg:p-11">
              <div className="rounded-[1.9rem] border border-slate-200/90 bg-white/88 p-7 shadow-sm backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  What this page is for
                </p>
                <ul className="mt-5 space-y-4 text-base leading-7 text-slate-600">
                  <li>Collect bizarre stories from players later.</li>
                  <li>Keep the product shell feeling real during the demo.</li>
                  <li>Avoid overbuilding before the core loop is validated.</li>
                </ul>

                <div className="mt-8 flex items-center gap-3">
                  <Link
                    href="/"
                    className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0"
                  >
                    Play the Game
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-ink hover:shadow-md active:translate-y-0"
                  >
                    View Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
