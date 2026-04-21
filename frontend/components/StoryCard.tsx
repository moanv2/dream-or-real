import Image from "next/image";
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
    <section className="motion-card-enter surface-card mx-auto w-full max-w-[640px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e8e0d6]">
        {!imageUnavailable ? (
          <>
            <Image
              src={imageSrc}
              alt={title}
              fill
              priority
              className="object-cover"
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

      <div className="px-10 pb-10 pt-7">
        <p className="meta-label">{sourceLabel}</p>
        <h2 className="font-serif text-[28px] font-normal leading-[1.3] tracking-[-0.01em] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-3 text-base leading-[1.65] text-[var(--text-secondary)]">
          {story.display_text}
        </p>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}
