"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CommunityActions,
  ReportReason,
  VoteValue,
} from "@/components/CommunityActions";
import { GuessButtons } from "@/components/GuessButtons";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StoryCard } from "@/components/StoryCard";
import { mockStories } from "@/lib/mock-stories";
import type { StoryAnswer } from "@/types/story";

type AnswerReview = {
  storyId: number;
  title: string;
  userAnswer: StoryAnswer;
  correctAnswer: StoryAnswer;
  isCorrect: boolean;
};

type StoryFeedback = {
  vote: VoteValue;
  reportedReason?: ReportReason;
};

function getPerformanceMessage(percentageCorrect: number) {
  if (percentageCorrect >= 90) {
    return "You have unnervingly strong dream instincts.";
  }

  if (percentageCorrect >= 75) {
    return "Strong read. You caught most of the weirdness correctly.";
  }

  if (percentageCorrect >= 50) {
    return "Respectable. Reality and dreams kept you guessing.";
  }

  if (percentageCorrect >= 25) {
    return "The stories won this round, but a few calls were sharp.";
  }

  return "Brutal round. The subconscious absolutely cooked you.";
}

export default function HomePage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<StoryAnswer | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answerHistory, setAnswerHistory] = useState<AnswerReview[]>([]);
  const [storyFeedback, setStoryFeedback] = useState<
    Record<number, StoryFeedback>
  >({});

  const totalStories = mockStories.length;
  const currentStory = mockStories[currentStoryIndex];
  const isCompleted = currentStoryIndex >= totalStories;

  const percentageCorrect = useMemo(() => {
    if (totalStories === 0) {
      return 0;
    }

    return Math.round((score / totalStories) * 100);
  }, [score, totalStories]);

  const performanceMessage = useMemo(
    () => getPerformanceMessage(percentageCorrect),
    [percentageCorrect],
  );
  const currentStoryFeedback = currentStory
    ? storyFeedback[currentStory.id] ?? { vote: null }
    : { vote: null };

  function handleGuess(answer: StoryAnswer) {
    if (isRevealed || isCompleted || !currentStory) {
      return;
    }

    const isCorrect = answer === currentStory.answer;

    setSelectedAnswer(answer);
    setIsRevealed(true);
    setAnswerHistory((history) => [
      ...history,
      {
        storyId: currentStory.id,
        title: currentStory.title,
        userAnswer: answer,
        correctAnswer: currentStory.answer,
        isCorrect,
      },
    ]);

    if (isCorrect) {
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
    setAnswerHistory([]);
    setStoryFeedback({});
  }

  function handleVoteChange(vote: VoteValue) {
    if (!currentStory) {
      return;
    }

    setStoryFeedback((current) => ({
      ...current,
      [currentStory.id]: {
        ...current[currentStory.id],
        vote,
      },
    }));
  }

  function handleReport(reason: ReportReason) {
    if (!currentStory) {
      return;
    }

    setStoryFeedback((current) => ({
      ...current,
      [currentStory.id]: {
        ...current[currentStory.id],
        vote: current[currentStory.id]?.vote ?? null,
        reportedReason: reason,
      },
    }));
  }

  return (
    <main className="app-page">
      <div className="app-frame flex min-h-[calc(100vh-5rem)] flex-col justify-center">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div className="max-w-[44rem]">
            <p className="section-kicker mb-4 transition-transform duration-300 hover:-translate-y-0.5">
              Dream or Real
            </p>
            <h1 className="section-title">
              One weird story. One quick guess.
            </h1>
            <p className="section-copy">
              Read the story, trust your instincts, then see what really happened.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/leaderboard"
                className="button-secondary px-4 py-2.5"
              >
                View Leaderboard
              </Link>
              <span className="text-sm leading-6 text-slate-500">mock standings for the demo</span>
            </div>
          </div>

          <ScoreBadge score={score} total={totalStories} />
        </div>

        <div className="panel-soft mb-7 p-4 transition-shadow duration-300 hover:shadow-md">
          <ProgressBar
            current={totalStories === 0 ? 0 : isCompleted ? totalStories : currentStoryIndex + 1}
            total={totalStories}
            completed={isCompleted}
          />
        </div>

        {totalStories === 0 ? (
          <section className="motion-card-enter surface-card overflow-hidden">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
                <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                  No Stories
                </span>
                <h2 className="mt-5 text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3rem]">
                  The deck is empty right now.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  There is nothing to guess yet, but the app shell is still ready.
                  Add stories to the local mock dataset or drop in a fresh batch for
                  the demo.
                </p>

                <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-6">
                  <Link href="/submit" className="button-primary">
                    Open Submit Page
                  </Link>
                  <Link href="/leaderboard" className="button-secondary">
                    View Leaderboard
                  </Link>
                </div>
              </div>

              <div className="p-9 lg:p-11">
                <div className="rounded-[1.9rem] border border-slate-200/90 bg-white/88 p-7 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Quick Recovery
                  </p>
                  <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
                    <p>Add entries to the local `mock-stories.ts` file.</p>
                    <p>Keep titles short and reveals satisfying.</p>
                    <p>The game loop will start working again as soon as stories exist.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {totalStories > 0 && isCompleted ? (
          <section className="motion-card-enter surface-card overflow-hidden">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
                <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                  Results
                </span>
                <h2 className="mt-5 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.05em] text-ink md:text-[3.6rem]">
                  Final score: {score}/{totalStories}
                </h2>
                <p className="motion-panel-enter mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  {performanceMessage}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="motion-panel-enter panel-soft border-0 bg-white p-6 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="meta-label">
                      Accuracy
                    </p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-ink">
                      {percentageCorrect}%
                    </p>
                  </div>
                  <div className="motion-panel-enter rounded-[1.75rem] bg-ink p-6 text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      Correct Picks
                    </p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">
                      {score}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 text-sm text-slate-600">
                  <div className="motion-panel-enter flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-slate-200/80 transition-transform duration-300 hover:-translate-y-0.5">
                    <span>Stories played</span>
                    <span className="font-semibold text-ink">{totalStories}</span>
                  </div>
                  <div className="motion-panel-enter flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-slate-200/80 transition-transform duration-300 hover:-translate-y-0.5">
                    <span>Misses</span>
                    <span className="font-semibold text-ink">{totalStories - score}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="button-primary"
                  >
                    Play Again
                  </button>
                  <Link href="/leaderboard" className="button-secondary">
                    View Leaderboard
                  </Link>
                </div>
              </div>

              <div className="p-9 lg:p-11">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Round Review
                    </p>
                    <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.04em] text-ink">
                      How each guess landed
                    </h3>
                  </div>
                  <span className="chip-soft transition-transform duration-300 hover:-translate-y-0.5">
                    {answerHistory.length} stories
                  </span>
                </div>

                <div className="space-y-3">
                  {answerHistory.length ? (
                    answerHistory.map((item, index) => (
                      <div
                        key={item.storyId}
                        className="motion-list-enter panel-soft rounded-[1.5rem] px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        style={{ animationDelay: `${index * 32}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold tracking-tight text-ink">
                              {item.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 transition-colors duration-300 hover:bg-slate-200/80">
                                You: {item.userAnswer}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 transition-colors duration-300 hover:bg-slate-200/80">
                                Answer: {item.correctAnswer}
                              </span>
                            </div>
                          </div>

                          <span
                            className={[
                              "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-transform duration-300 hover:-translate-y-0.5",
                              item.isCorrect
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
                            ].join(" ")}
                          >
                            {item.isCorrect ? "Correct" : "Miss"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="motion-panel-enter rounded-[1.75rem] border border-dashed border-slate-300 bg-white/82 px-6 py-10 text-center shadow-sm">
                      <p className="text-lg font-semibold tracking-tight text-ink">
                        No round history to review.
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        The score summary still worked, but this session did not
                        retain individual story outcomes.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : totalStories > 0 ? (
          <StoryCard key={currentStory.id} story={currentStory}>
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
                    "motion-panel-enter rounded-[1.8rem] border p-6 shadow-lg transition-all duration-300",
                    selectedAnswer === currentStory.answer
                      ? "border-emerald-200 bg-[linear-gradient(180deg,#173c33_0%,#112f28_100%)] text-white"
                      : "border-rose-200 bg-[linear-gradient(180deg,#4b2026_0%,#31161a_100%)] text-white",
                  ].join(" ")}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      {selectedAnswer === currentStory.answer ? "Correct" : "Incorrect"}
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 transition-all duration-300 hover:bg-white/15">
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

              {isRevealed ? (
                <CommunityActions
                  vote={currentStoryFeedback.vote}
                  reportedReason={currentStoryFeedback.reportedReason}
                  onVoteChange={handleVoteChange}
                  onReport={handleReport}
                />
              ) : null}

              <div
                className={[
                  "flex items-center justify-between gap-4 border-t border-slate-200/90 pt-5 transition-all duration-300",
                  isRevealed ? "motion-panel-enter" : "",
                ].join(" ")}
              >
                <p className="text-sm leading-6 text-slate-500 transition-colors duration-300">
                  {isRevealed
                    ? "Locked in. Move to the next story when you are ready."
                    : "Pick one answer to reveal the result immediately."}
                </p>
                <button
                  type="button"
                  onClick={handleNextStory}
                  className={[
                    "button-base px-5 py-2.5",
                    isRevealed
                      ? "bg-accent text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0 active:scale-[0.99]"
                      : "border border-slate-200 bg-slate-100 text-slate-400",
                  ].join(" ")}
                  disabled={!isRevealed}
                >
                  {currentStoryIndex === totalStories - 1 ? "See Results" : "Next Story"}
                </button>
              </div>
            </div>
          </StoryCard>
        ) : null}
      </div>
    </main>
  );
}
