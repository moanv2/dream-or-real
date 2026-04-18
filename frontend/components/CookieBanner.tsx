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
  const [noPosition, setNoPosition] = useState<NoPosition>({ x: 280, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isVisible || isNoUnlocked || isNoConverted) {
      return;
    }

    positionNoButton(true);
  }, [isVisible, isNoUnlocked, isNoConverted]);

  function dismissBanner() {
    setIsVisible(false);
  }

  function getAlignedRowY(actionArea: HTMLDivElement, noButton: HTMLButtonElement) {
    const actionRow = actionRowRef.current;

    if (!actionRow) {
      return 0;
    }

    const nextY = actionRow.offsetTop - actionArea.offsetTop + 8;
    const maxY = Math.max(actionArea.clientHeight - noButton.offsetHeight - 12, 0);

    return Math.min(Math.max(nextY, 0), maxY);
  }

  function positionNoButton(keepAlignedY = false) {
    const actionArea = escapeAreaRef.current;
    const noButton = noButtonRef.current;

    if (!actionArea || !noButton) {
      return;
    }

    const padding = 14;
    const safeLeftLane = 160;
    const minTopLane = 8;
    const maxX = Math.max(actionArea.clientWidth - noButton.offsetWidth - padding, padding);
    const maxY = Math.max(actionArea.clientHeight - noButton.offsetHeight - padding, padding);
    const minX = Math.min(Math.max(Math.floor(actionArea.clientWidth * 0.42), safeLeftLane), maxX);
    const alignedY = getAlignedRowY(actionArea, noButton);
    const minY = Math.min(Math.max(Math.floor(actionArea.clientHeight * 0.12), minTopLane), maxY);
    const nextX = minX >= maxX
      ? maxX
      : Math.floor(minX + Math.random() * Math.max(maxX - minX, 1));
    const nextY = keepAlignedY
      ? alignedY
      : minY >= maxY
        ? maxY
        : Math.floor(minY + Math.random() * Math.max(maxY - minY, 1));

    setNoPosition({ x: nextX, y: nextY });
  }

  function handleNoTease() {
    if (isNoUnlocked || isNoConverted) {
      return;
    }

    setAttempts((currentAttempts) => {
      const nextAttempts = currentAttempts + 1;

      if (nextAttempts >= unlockThreshold) {
        setIsNoUnlocked(true);
        return nextAttempts;
      }

      positionNoButton();
      return nextAttempts;
    });
  }

  function handleNoClick() {
    if (!isNoUnlocked && !isNoConverted) {
      handleNoTease();
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
        ? "These demo cookies do nothing except make the whole ritual feel more serious."
        : `Your preference has been noted and artistically avoided. Survive ${unlockThreshold - attempts} more move${unlockThreshold - attempts === 1 ? "" : "s"}.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pb-6 lg:px-8">
      <section className="pointer-events-auto motion-panel-enter relative w-full max-w-[34rem] overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)]">
        <div
          ref={escapeAreaRef}
          className="pointer-events-none absolute inset-x-4 top-4 bottom-16 z-20"
        >
          <button
            ref={noButtonRef}
            type="button"
            onMouseEnter={handleNoTease}
            onFocus={handleNoTease}
            onClick={handleNoClick}
            className={[
              "pointer-events-auto absolute min-w-[7rem] rounded-xl border px-5 py-3 text-sm font-semibold uppercase tracking-[0.04em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
              isNoConverted
                ? "border-transparent bg-[var(--accent-gold)] text-[var(--text-primary)] shadow-[var(--shadow-button)]"
                : "border-[var(--border-card)] bg-[rgba(255,255,255,0.72)] text-[var(--text-secondary)] shadow-[var(--shadow-button)]",
            ].join(" ")}
            style={{
              left: `${noPosition.x}px`,
              top: `${noPosition.y}px`,
            }}
          >
            {isNoConverted ? "Yes" : "No"}
          </button>
        </div>

        <div className="border-b border-[var(--border-card)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker transition-none">Cookie situation</p>
              <h2 className="mt-4 max-w-[22rem] font-serif text-[2rem] leading-[1.14] tracking-[-0.02em] text-[var(--text-primary)]">
                May we deploy some absolutely essential demo cookies?
              </h2>
            </div>
            <span className="rounded-md border border-[var(--border-card)] bg-[rgba(240,235,225,0.7)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              fake only
            </span>
          </div>
          <p className="mt-4 max-w-[28rem] text-sm leading-7 text-[var(--text-secondary)]">
            This is a joke banner for the hackathon demo. It is not legal advice,
            not production consent, and definitely not subtle.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
            {helperCopy}
          </div>

          <div
            ref={actionRowRef}
            className="relative mt-5 h-[4.7rem] rounded-xl border border-dashed border-[rgba(107,101,96,0.25)] bg-[rgba(255,255,255,0.52)] px-3 py-2"
          >
            <button
              type="button"
              onClick={dismissBanner}
              className="button-primary absolute left-2 top-2 min-w-[7rem] px-6"
            >
              Yes
            </button>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Page-load only. Refresh and the extremely important cookie question returns.
          </p>
        </div>
      </section>
    </div>
  );
}
