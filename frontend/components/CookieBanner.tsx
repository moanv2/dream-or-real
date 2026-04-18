"use client";

import { useEffect, useRef, useState } from "react";

type NoPosition = {
  x: number;
  y: number;
};

export function CookieBanner() {
  const escapeAreaRef = useRef<HTMLDivElement>(null);
  const actionRowRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isNoUnlocked, setIsNoUnlocked] = useState(false);
  const [isNoConverted, setIsNoConverted] = useState(false);
  const [unlockThreshold] = useState(() => Math.floor(Math.random() * 3) + 5);
  const [noPosition, setNoPosition] = useState<NoPosition>({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isVisible || isNoUnlocked || isNoConverted) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      positionNoButton(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isVisible, isNoUnlocked, isNoConverted]);

  function dismissBanner() {
    setIsVisible(false);
  }

  function getAlignedPosition(actionArea: HTMLDivElement, noButton: HTMLButtonElement) {
    const actionRow = actionRowRef.current;

    if (!actionRow) {
      return { x: 0, y: 0 };
    }

    const alignedX =
      actionRow.offsetLeft -
      actionArea.offsetLeft +
      actionRow.clientWidth * (2 / 3) -
      noButton.offsetWidth / 2;
    const alignedY = actionRow.offsetTop - actionArea.offsetTop;

    return {
      x: Math.max(alignedX, 0),
      y: Math.max(alignedY, 0),
    };
  }

  function positionNoButton(keepAligned = false) {
    const actionArea = escapeAreaRef.current;
    const noButton = noButtonRef.current;

    if (!actionArea || !noButton) {
      return;
    }

    const padding = 8;
    const maxX = Math.max(actionArea.clientWidth - noButton.offsetWidth - padding, 0);
    const maxY = Math.max(actionArea.clientHeight - noButton.offsetHeight - padding, 0);
    const aligned = getAlignedPosition(actionArea, noButton);

    if (keepAligned) {
      setNoPosition({
        x: Math.min(aligned.x, maxX),
        y: Math.min(aligned.y, maxY),
      });
      return;
    }

    const minX = Math.min(Math.max(Math.floor(actionArea.clientWidth * 0.42), aligned.x - 24), maxX);
    const minY = Math.min(Math.max(aligned.y - 18, 0), maxY);

    setNoPosition({
      x:
        minX >= maxX
          ? maxX
          : Math.floor(minX + Math.random() * Math.max(maxX - minX, 1)),
      y:
        minY >= maxY
          ? maxY
          : Math.floor(minY + Math.random() * Math.max(maxY - minY, 1)),
    });
  }

  function handleNoClick() {
    if (!isNoUnlocked && !isNoConverted) {
      setAttempts((currentAttempts) => {
        const nextAttempts = currentAttempts + 1;

        if (nextAttempts >= unlockThreshold) {
          setIsNoUnlocked(true);
          return nextAttempts;
        }

        positionNoButton();
        return nextAttempts;
      });
      return;
    }

    if (!isNoConverted) {
      setIsNoConverted(true);
      return;
    }

    dismissBanner();
  }

  if (!isReady || !isVisible) {
    return null;
  }

  const helperCopy = isNoConverted
    ? "Perfect. That is the kind of informed consent energy we were hoping for."
    : isNoUnlocked
      ? "Fine. You found it. Go ahead and click it."
      : attempts === 0
        ? "These demo cookies do nothing except make the ritual feel official."
        : `Your preference has been noted and artistically avoided. Survive ${unlockThreshold - attempts} more move${unlockThreshold - attempts === 1 ? "" : "s"}.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pb-6 lg:px-8">
      <section className="pointer-events-auto motion-panel-enter relative w-full max-w-[38rem] overflow-hidden rounded-[1.05rem] border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.26)]">
        <div
          ref={escapeAreaRef}
          className="pointer-events-none absolute inset-x-5 bottom-[2rem] top-[6.25rem] z-20"
        >
          <button
            ref={noButtonRef}
            type="button"
            onClick={handleNoClick}
            className={[
              "pointer-events-auto absolute left-0 top-0 inline-flex w-[5.5rem] items-center justify-center rounded-[0.85rem] border px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.03em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
              isNoConverted
                ? "border-transparent bg-[var(--accent-gold)] text-[var(--text-primary)] shadow-[var(--shadow-button)]"
                : "border-[var(--border-card)] bg-[rgba(255,255,255,0.72)] text-[var(--text-secondary)] shadow-[var(--shadow-button)]",
            ].join(" ")}
            style={{
              transform: `translate3d(${noPosition.x}px, ${noPosition.y}px, 0)`,
              transition:
                "transform 460ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
            }}
          >
            {isNoConverted ? "Yes" : "No"}
          </button>
        </div>

        <div className="px-5 pb-3 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Cookie situation
          </p>
          <h2 className="mt-1.5 max-w-[29rem] font-serif text-[1rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] sm:text-[1.15rem]">
            May we deploy some absolutely essential demo cookies?
          </h2>
          <p className="mt-1.5 max-w-[31rem] text-[0.84rem] leading-5 text-[var(--text-secondary)]">
            Demo joke only. Not legal advice, not production consent.
          </p>

          <div className="mt-2 text-[0.84rem] leading-5 text-[var(--text-secondary)]">
            {helperCopy}
          </div>

          <div ref={actionRowRef} className="relative mt-3 h-[3.1rem]">
            <button
              type="button"
              onClick={dismissBanner}
              className="absolute left-1/3 top-0 inline-flex w-[5.5rem] -translate-x-1/2 items-center justify-center rounded-[0.85rem] border border-transparent bg-[var(--accent-gold)] px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-[0.03em] text-[var(--text-primary)] shadow-[var(--shadow-button)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[var(--shadow-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
            >
              Yes
            </button>
          </div>

          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Page-load only. Refresh and it returns.
          </p>
        </div>
      </section>
    </div>
  );
}
