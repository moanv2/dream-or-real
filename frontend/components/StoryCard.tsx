import Image from "next/image";
import { useState } from "react";
import type { ReactNode } from "react";
import type { Story } from "@/types/story";

type StoryCardProps = {
  story: Story;
  children?: ReactNode;
};

export function StoryCard({ story, children }: StoryCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <section className="motion-card-enter group surface-card overflow-hidden">
      <div className="grid min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between p-9 lg:p-11">
          <div>
            <div className="mb-7 flex items-center gap-3">
              {story.tag ? (
                <span className="rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning transition-transform duration-300 group-hover:-translate-y-0.5">
                  {story.tag}
                </span>
              ) : null}
              <span className="text-sm font-medium tracking-tight text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                Story #{story.id}
              </span>
            </div>

            <h2 className="max-w-2xl text-[2.35rem] font-semibold leading-[1.01] tracking-[-0.048em] text-ink md:text-[2.85rem]">
              {story.title}
            </h2>
            <p className="mt-6 max-w-2xl text-[1.03rem] leading-8 text-slate-600 md:text-[1.08rem]">
              {story.summary}
            </p>
          </div>

          {children}
        </div>

        <div className="border-t border-slate-200 bg-[linear-gradient(180deg,#e9eff6_0%,#dfe8f1_100%)] p-5 lg:border-l lg:border-t-0 lg:p-6">
          <div className="relative flex h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-white/75 bg-[#e8eef6] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_18px_40px_rgba(21,32,51,0.08)]">
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-white/90">
              {imageUnavailable ? "Image Missing" : "Comic Scene"}
            </div>
            {imageUnavailable ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_42%),linear-gradient(180deg,#dfe8f1_0%,#e8eef6_100%)] px-8 text-center">
                <div className="rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  Fallback Artwork
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight text-ink">
                  Artwork unavailable
                </p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  The story still works without the image. A replacement visual can
                  be dropped in later without changing the layout.
                </p>
              </div>
            ) : (
              <Image
                src={story.comicImage}
                alt={story.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                priority
                onError={() => setImageUnavailable(true)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
