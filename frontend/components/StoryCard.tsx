import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { resolveAssetUrl } from "@/lib/asset-path";
import type { StorySummary } from "@/types/story";

type StoryCardProps = {
  story: StorySummary;
  children?: ReactNode;
};

export function StoryCard({ story, children }: StoryCardProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const title = story.title ?? "Untitled story";
  const imageSrc = resolveAssetUrl(story.comic_image_url ?? "/comics/library-sleepwalk.svg");

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  return (
    <>
      <section className="motion-card-enter surface-card mx-auto flex w-full max-w-[680px] flex-col">
        <div className="relative h-[clamp(130px,24svh,220px)] shrink-0 overflow-hidden bg-[#e8e0d6] sm:h-[clamp(150px,30dvh,240px)]">
          {!imageUnavailable ? (
            <>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="group relative h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
                aria-label="Open comic preview"
              >
                <img
                  src={imageSrc}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  onError={() => setImageUnavailable(true)}
                />
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--bg-card)]" />
              <div className="pointer-events-none absolute right-3 top-3 hidden rounded-md bg-[rgba(14,13,12,0.58)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white sm:block">
                Click to expand
              </div>
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

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4 lg:px-8 lg:pb-7 lg:pt-5">
          <h2 className="font-serif text-[clamp(1.35rem,5.5vw,1.75rem)] font-normal leading-[1.15] tracking-[-0.01em] text-[var(--text-primary)] sm:leading-[1.25]">
            {title}
          </h2>
          <p className="mt-2 overflow-hidden text-[13px] leading-5 text-[var(--text-secondary)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:6] sm:text-[14px] sm:leading-6 sm:[-webkit-line-clamp:7] lg:[-webkit-line-clamp:8]">
            {story.display_text}
          </p>

          {children ? <div className="mt-3 sm:mt-4">{children}</div> : null}
        </div>
      </section>

      {isLightboxOpen && !imageUnavailable ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(0,0,0,0.68)] px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Comic preview"
        >
          <div
            className="motion-panel-enter relative w-full max-w-[min(98vw,1100px)] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.24)] bg-[#111] shadow-[0_24px_80px_rgba(0,0,0,0.62)] sm:max-w-[min(96vw,1100px)] sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={imageSrc} alt={title} className="max-h-[84dvh] w-full object-contain" />
            <div className="flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.14)] bg-[rgba(8,8,8,0.76)] px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="truncate text-xs font-medium text-white sm:text-sm">{title}</p>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.25)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] sm:px-3 sm:text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
