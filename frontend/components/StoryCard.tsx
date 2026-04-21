import { useState } from "react";
import type { ReactNode } from "react";
import type { StorySummary } from "@/types/story";

type StoryCardProps = {
  story: StorySummary;
  children?: ReactNode;
};

export function StoryCard({ story, children }: StoryCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const title = story.title ?? "Untitled story";
  const sourceLabel = story.source === "seed" ? "Seed story" : "Community story";
  const imageSrc = story.comic_image_url ?? "/comics/library-sleepwalk.svg";

  return (
    <section className="motion-card-enter surface-card mx-auto flex w-full max-w-[640px] flex-col">
      <div className="relative h-[clamp(150px,30dvh,240px)] shrink-0 overflow-hidden bg-[#e8e0d6]">
        {!imageUnavailable ? (
          <>
            <img
              src={imageSrc}
              alt={title}
              className="h-full w-full object-cover"
              onError={() => setImageUnavailable(true)}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--bg-card)]" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card-reveal)] px-8 text-center">
            <div>
              <p className="font-serif text-[2rem] leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                Artwork unavailable
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                The story still works without the image.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4 lg:px-8 lg:pb-7 lg:pt-5">
        <p className="meta-label">{sourceLabel}</p>
        <h2 className="font-serif text-[24px] font-normal leading-[1.25] tracking-[-0.01em] text-[var(--text-primary)] lg:text-[26px]">
          {title}
        </h2>
        <p className="mt-2 overflow-hidden text-[15px] leading-6 text-[var(--text-secondary)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5]">
          {story.display_text}
        </p>

        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </section>
  );
}
