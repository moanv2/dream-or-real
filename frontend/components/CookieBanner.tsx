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

    const padding = 12;
    const safeLeftLane = 152;
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
        ? "Demo cookies make the weird stories feel more official."
        : `We heard your preference. It is currently being ignored for comedic reasons. Survive ${unlockThreshold - attempts} more move${unlockThreshold - attempts === 1 ? "" : "s"}.`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-6 pb-6 lg:px-8">
      <section className="pointer-events-auto motion-panel-enter relative w-full max-w-[31rem] overflow-hidden rounded-[1.9rem] border border-white/85 bg-paper/95 shadow-card backdrop-blur">
        <div
          ref={escapeAreaRef}
          className="pointer-events-none absolute inset-x-4 top-4 bottom-14 z-20"
        >
          <button
            ref={noButtonRef}
            type="button"
            onMouseEnter={handleNoTease}
            onFocus={handleNoTease}
            onClick={handleNoClick}
            className={[
              "button-secondary pointer-events-auto absolute min-w-[7rem] px-5 py-2.5 shadow-md",
              isNoConverted ? "border-accent bg-accent text-white hover:border-accent hover:text-white" : "",
            ].join(" ")}
            style={{
              left: `${noPosition.x}px`,
              top: `${noPosition.y}px`,
            }}
          >
            {isNoConverted ? "Yes" : "No"}
          </button>
        </div>

        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker transition-none">
                Cookie Situation
              </p>
              <h2 className="mt-4 text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-ink">
                May we deploy some absolutely essential demo cookies?
              </h2>
            </div>
            <span className="chip-soft shrink-0">
              fake only
            </span>
          </div>
          <p className="mt-4 max-w-[26rem] text-sm leading-7 text-slate-600">
            This is a joke banner for the hackathon demo. It is not legal advice,
            not production consent, and definitely not subtle.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="panel-muted px-4 py-3 text-sm leading-6 text-slate-600">
            {helperCopy}
          </div>

          <div
            ref={actionRowRef}
            className="relative mt-5 h-[4.5rem] rounded-[1.4rem] border border-dashed border-slate-300/90 bg-white/80 px-3 py-2"
          >
            <button
              type="button"
              onClick={dismissBanner}
              className="button-primary absolute left-2 top-2 min-w-[7rem] px-6 py-2.5"
            >
              Yes
            </button>
          </div>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Page-load only. Refresh and the extremely important cookie question returns.
          </p>
        </div>
      </section>
    </div>
  );
}
