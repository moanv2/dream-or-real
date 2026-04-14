"use client";

import { useMemo, useState } from "react";
import { GuessButtons } from "@/components/GuessButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StoryCard } from "@/components/StoryCard";
import { mockStories } from "@/lib/mock-stories";
import type { StoryAnswer } from "@/types/story";

export default function HomePage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<StoryAnswer | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const totalStories = mockStories.length;
  const currentStory = mockStories[currentStoryIndex];
  const isCompleted = currentStoryIndex >= totalStories;

  const percentageCorrect = useMemo(() => {
    if (totalStories === 0) {
      return 0;
    }

    return Math.round((score / totalStories) * 100);
  }, [score, totalStories]);

  function handleGuess(answer: StoryAnswer) {
    if (isRevealed || isCompleted) {
      return;
    }

    setSelectedAnswer(answer);
    setIsRevealed(true);

    if (answer === currentStory.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleNextStory() {
    if (!isRevealed) {
      return;
    }

    setSelectedAnswer(null);
    setIsRevealed(false);
    setCurrentStoryIndex((index) => index + 1);
  }

  function handleRestart() {
    setCurrentStoryIndex(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setScore(0);
  }

  return (
    <main className="min-h-screen bg-mist px-6 py-10 text-ink lg:px-8 lg:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div className="max-w-[44rem]">
            <p className="mb-4 inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm backdrop-blur">
              Dream or Real
            </p>
            <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3.7rem]">
              One weird story. One quick guess.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Read the story, trust your instincts, then see what really happened.
            </p>
          </div>

          <ScoreBadge score={score} total={totalStories} />
        </div>

        <div className="mb-7 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
          <ProgressBar
            current={isCompleted ? totalStories : currentStoryIndex + 1}
            total={totalStories}
            completed={isCompleted}
          />
        </div>

        {isCompleted ? (
          <section className="overflow-hidden rounded-4xl border border-white/80 bg-paper/95 shadow-card">
            <div className="grid min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-between p-9 lg:p-11">
                <div>
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                    Finished
                  </span>
                  <h2 className="mt-5 text-[2.6rem] font-semibold leading-[1] tracking-[-0.05em] md:text-[3.25rem]">
                    Game over.
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                    You made it through all {totalStories} stories. Restart to play the same set again or swap in new mock data later.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/90">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Final Score
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink">
                      {score} / {totalStories}
                    </p>
                  </div>
                  <div className="rounded-[1.75rem] bg-ink p-6 text-white shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      Accuracy
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                      {percentageCorrect}%
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0"
                  >
                    Restart Game
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center border-t border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_transparent_48%),linear-gradient(180deg,_#dbe6f2_0%,_#edf3f8_100%)] p-10 lg:border-l lg:border-t-0">
                <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/82 p-8 shadow-lg backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Session Summary
                  </p>
                  <div className="mt-6 space-y-4 text-slate-600">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-100/90 px-4 py-3">
                      <span>Correct guesses</span>
                      <span className="font-semibold text-ink">{score}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-100/90 px-4 py-3">
                      <span>Incorrect guesses</span>
                      <span className="font-semibold text-ink">{totalStories - score}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-100/90 px-4 py-3">
                      <span>Stories played</span>
                      <span className="font-semibold text-ink">{totalStories}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <StoryCard story={currentStory}>
            <div className="mt-10 space-y-6">
              <GuessButtons
                disabled={isRevealed}
                selectedAnswer={selectedAnswer}
                correctAnswer={isRevealed ? currentStory.answer : undefined}
                onGuess={handleGuess}
              />

              {isRevealed ? (
                <section
                  className={[
                    "rounded-[1.8rem] border p-6 shadow-lg transition-all duration-300",
                    selectedAnswer === currentStory.answer
                      ? "border-emerald-200 bg-[linear-gradient(180deg,#173c33_0%,#112f28_100%)] text-white"
                      : "border-rose-200 bg-[linear-gradient(180deg,#4b2026_0%,#31161a_100%)] text-white",
                  ].join(" ")}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {selectedAnswer === currentStory.answer ? "Correct" : "Incorrect"}
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                      Answer: {currentStory.answer}
                    </span>
                  </div>

                  <p className="mb-4 text-[1.45rem] font-semibold leading-tight tracking-[-0.03em]">
                    {selectedAnswer === currentStory.answer
                      ? "Nice call. That one really happened."
                      : currentStory.answer === "dream"
                        ? "Dream. The weirdness was subconscious."
                        : "Real. The world is stranger than it should be."}
                  </p>

                  <p className="max-w-2xl text-[1rem] leading-7 text-white/85">
                    {currentStory.revealText}
                  </p>
                </section>
              ) : null}

              <div className="flex items-center justify-between gap-4 border-t border-slate-200/90 pt-5">
                <p className="text-sm leading-6 text-slate-500">
                  {isRevealed
                    ? "Locked in. Move to the next story when you are ready."
                    : "Pick one answer to reveal the result immediately."}
                </p>
                <button
                  type="button"
                  onClick={handleNextStory}
                  className={[
                    "rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    isRevealed
                      ? "bg-accent text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0"
                      : "border border-slate-200 bg-slate-100 text-slate-400",
                  ].join(" ")}
                  disabled={!isRevealed}
                >
                  {currentStoryIndex === totalStories - 1 ? "See Results" : "Next Story"}
                </button>
              </div>
            </div>
          </StoryCard>
        )}
      </div>
    </main>
  );
}
