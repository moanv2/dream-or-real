"use client";

import { useEffect, useRef, useState } from "react";
import { resolveAssetUrl } from "@/lib/asset-path";
import manifest from "@/lib/easter-eggs.generated.json";

const MIN_INTERVAL_MS = 20_000;
const MAX_INTERVAL_MS = 60_000;
const FLASH_DURATION_MS = 500;
const IMAGE_DURATION_MS = 2_000;

type Props = { active: boolean };

const allImages: string[] = ((manifest as { images: string[] }).images ?? []).map(resolveAssetUrl);

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function pickInterval(): number {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

function isDisabledByUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("spooky") === "off";
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

type Phase = "flash" | "image";

type ScareState = { phase: Phase; image: string };

export function EasterEggOverlay({ active }: Props) {
  const [state, setState] = useState<ScareState | null>(null);
  const scheduleRef = useRef<number | null>(null);
  const phaseRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || allImages.length === 0) return;
    if (isDisabledByUrl()) return;
    if (prefersReducedMotion()) return;

    function clearTimers() {
      if (scheduleRef.current !== null) window.clearTimeout(scheduleRef.current);
      if (phaseRef.current !== null) window.clearTimeout(phaseRef.current);
      scheduleRef.current = null;
      phaseRef.current = null;
    }

    function schedule() {
      const delay = pickInterval();
      scheduleRef.current = window.setTimeout(() => {
        const next = pickRandom(allImages);
        if (!next) {
          schedule();
          return;
        }
        // Phase 1: white flashbang
        setState({ phase: "flash", image: next });
        phaseRef.current = window.setTimeout(() => {
          // Phase 2: reveal image
          setState({ phase: "image", image: next });
          phaseRef.current = window.setTimeout(() => {
            setState(null);
            schedule();
          }, IMAGE_DURATION_MS);
        }, FLASH_DURATION_MS);
      }, delay);
    }

    schedule();
    return () => {
      clearTimers();
      setState(null);
    };
  }, [active]);

  if (!state) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      {state.phase === "image" ? (
        <img
          src={state.image}
          alt=""
          className="motion-jumpscare-pop absolute inset-0 h-full w-full object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      ) : null}
    </div>
  );
}
