import Image from "next/image";
import type { ReactNode } from "react";
import type { Story } from "@/types/story";

type StoryCardProps = {
  story: Story;
  children?: ReactNode;
};

export function StoryCard({ story, children }: StoryCardProps) {
  return (
    <section className="motion-card-enter group overflow-hidden rounded-4xl border border-white/80 bg-paper/95 shadow-card backdrop-blur">
      <div className="grid min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between p-9 lg:p-11">
          <div>
            <div className="mb-6 flex items-center gap-3">
              {story.tag ? (
                <span className="rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning transition-transform duration-300 group-hover:-translate-y-0.5">
                  {story.tag}
                </span>
              ) : null}
              <span className="text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                Story #{story.id}
              </span>
            </div>

            <h2 className="max-w-2xl text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink md:text-[2.85rem]">
              {story.title}
            </h2>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-slate-600 md:text-[1.1rem]">
              {story.summary}
            </p>
          </div>

          {children}
        </div>

        <div className="border-t border-slate-200 bg-[linear-gradient(180deg,#e9eff6_0%,#dfe8f1_100%)] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="relative flex h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-white/75 bg-[#e8eef6] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/90">
              Comic Scene
            </div>
            <Image
              src={story.comicImage}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
