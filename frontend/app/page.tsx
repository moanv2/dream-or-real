"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GuessButtons } from "@/components/GuessButtons";
import { StoryCard } from "@/components/StoryCard";
import { getRandomStory, revealStory } from "@/lib/api";
import type { StoryAnswer, StoryReveal, StorySummary } from "@/types/story";

const SCORE_STORAGE_KEY = "dream-or-real:score";
const TOTAL_STORAGE_KEY = "dream-or-real:total";

function statusTone(isCorrect: boolean) {
  return isCorrect ? "text-[#3d8b4f]" : "text-[#b84233]";
}

function readStoredCount(key: string) {
  const rawValue = window.localStorage.getItem(key);
  const parsedValue = Number.parseInt(rawValue ?? "0", 10);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }
  return parsedValue;
}

export default function HomePage() {
  const [story, setStory] = useState<StorySummary | null>(null);
  const [revealedStory, setRevealedStory] = useState<StoryReveal | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<StoryAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [statsHydrated, setStatsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStory() {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setRevealedStory(null);

    try {
      const nextStory = await getRandomStory();
      setStory(nextStory);
    } catch (loadError) {
      setStory(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load a story.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStory();
  }, []);

  useEffect(() => {
    setScore(readStoredCount(SCORE_STORAGE_KEY));
    setTotal(readStoredCount(TOTAL_STORAGE_KEY));
    setStatsHydrated(true);
  }, []);

  useEffect(() => {
    if (!statsHydrated) {
      return;
    }
    window.localStorage.setItem(SCORE_STORAGE_KEY, String(score));
    window.localStorage.setItem(TOTAL_STORAGE_KEY, String(total));
  }, [score, statsHydrated, total]);

  async function handleGuess(answer: StoryAnswer) {
    if (!story || revealedStory || isRevealing) {
      return;
    }

    setSelectedAnswer(answer);
    setIsRevealing(true);
    setError(null);

    try {
      const reveal = await revealStory(story.id);
      setRevealedStory(reveal);
      setTotal((currentTotal) => currentTotal + 1);
      if (reveal.label === answer) {
        setScore((currentScore) => currentScore + 1);
      }
    } catch (revealError) {
      setSelectedAnswer(null);
      setError(revealError instanceof Error ? revealError.message : "Failed to reveal story.");
    } finally {
      setIsRevealing(false);
    }
  }

  const isRevealed = Boolean(revealedStory);
  const isCorrect = isRevealed && selectedAnswer === revealedStory?.label;

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border-subtle)] bg-[rgba(22,20,18,0.85)] px-8 backdrop-blur lg:px-12">
        <div className="justify-self-start text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark)]">
          Dream or Real
        </div>

        <nav className="justify-self-center flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md bg-[rgba(250,246,239,0.08)] px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark)] transition-colors duration-150 hover:bg-[rgba(250,246,239,0.12)]"
          >
            Play
          </Link>
          <Link
            href="/submit"
            className="rounded-md px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark-muted)] transition-colors duration-150 hover:bg-[rgba(250,246,239,0.04)] hover:text-[var(--text-on-dark)]"
          >
            Submit
          </Link>
        </nav>

        <div className="justify-self-end flex w-[160px] items-end justify-end gap-5">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-on-dark-muted)]">
              Score
            </span>
            <span className="text-xl font-bold leading-none text-[var(--accent-gold)]">
              {score}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-on-dark-muted)]">
              Total
            </span>
            <span className="text-xl font-bold leading-none text-[var(--text-on-dark)]">
              {total}
            </span>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-56px)] items-center justify-center px-6 py-12 lg:px-12 lg:py-16">
        {isLoading ? (
          <section className="motion-card-enter surface-card w-full max-w-[640px] px-10 py-10">
            <p className="meta-label">Loading</p>
            <h1 className="mt-4 font-serif text-[32px] leading-[1.18] tracking-[-0.02em] text-[var(--text-primary)]">
              Pulling a strange story from the stack.
            </h1>
            <p className="mt-4 text-base leading-[1.65] text-[var(--text-secondary)]">
              Pulling the next story for your round.
            </p>
          </section>
        ) : !story ? (
          <section className="motion-card-enter surface-card w-full max-w-[640px] px-10 py-10">
            <p className="meta-label">Problem</p>
            <h1 className="mt-4 font-serif text-[32px] leading-[1.18] tracking-[-0.02em] text-[var(--text-primary)]">
              The story feed is unavailable.
            </h1>
            <p className="mt-4 text-base leading-[1.65] text-[var(--text-secondary)]">
              {error ?? "No story was returned."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => void loadStory()} className="button-primary">
                Try again
              </button>
              <Link href="/submit" className="button-subtle">
                Submit story
              </Link>
            </div>
          </section>
        ) : story ? (
          <StoryCard key={story.id} story={story}>
            {error ? (
              <div className="mb-5 rounded-2xl border border-[rgba(190,60,50,0.22)] bg-[rgba(190,60,50,0.08)] px-4 py-3 text-sm leading-7 text-[#8e2f25]">
                {error}
              </div>
            ) : null}

            <GuessButtons
              disabled={isRevealed || isRevealing}
              selectedAnswer={selectedAnswer}
              correctAnswer={revealedStory?.label}
              onGuess={(answer) => void handleGuess(answer)}
            />

            <div
              className={[
                "transition-opacity duration-300",
                isRevealed ? "max-h-none overflow-visible opacity-100" : "max-h-0 overflow-hidden opacity-0",
              ].join(" ")}
            >
              {revealedStory ? (
                <div className="pt-6">
                  <div className="mb-5 h-px w-full bg-[var(--border-card)]" />
                  <div
                    className={[
                      "rounded-2xl border p-5",
                      isCorrect
                        ? "border-[rgba(76,160,96,0.22)] bg-[rgba(76,160,96,0.09)]"
                        : "border-[rgba(190,60,50,0.22)] bg-[rgba(190,60,50,0.08)]",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-base font-semibold uppercase tracking-[0.05em]",
                        statusTone(isCorrect),
                      ].join(" ")}
                    >
                      {isCorrect ? "Right" : "Wrong"}
                    </p>
                    <p className="mt-3 text-base leading-8 text-[var(--text-primary)]">
                      It was <span className="font-semibold">{revealedStory.label}</span>.
                    </p>
                  </div>

                  <div className="mt-7">
                    <button type="button" onClick={() => void loadStory()} className="button-primary">
                      Next Story
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {!isRevealed ? (
              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                <span>Pick your answer first.</span>
                {isRevealing ? (
                  <span className="font-semibold text-[var(--text-primary)]">Revealing...</span>
                ) : null}
              </div>
            ) : null}
          </StoryCard>
        ) : null}
      </main>
    </div>
  );
}
