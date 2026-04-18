"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ReportReason, VoteValue } from "@/components/CommunityActions";
import { GuessButtons } from "@/components/GuessButtons";
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

function VoteArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={[
        "h-[18px] w-[18px] fill-current",
        direction === "down" ? "rotate-180" : "",
      ].join(" ")}
    >
      <path d="M10 1.5 19 10h-4.2v8.5H5.2V10H1z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M5 1.75a1 1 0 0 1 1 1v.46h7.05c1.68 0 2.55 2.03 1.37 3.26l-.43.44c-.5.52-.5 1.33 0 1.85l.43.44c1.18 1.23.31 3.26-1.37 3.26H6v4.79a1 1 0 1 1-2 0V2.75a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export default function HomePage() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<StoryAnswer | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] =
    useState<ReportReason>("low quality");
  const [answerHistory, setAnswerHistory] = useState<AnswerReview[]>([]);
  const [storyFeedback, setStoryFeedback] = useState<Record<number, StoryFeedback>>(
    {},
  );

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
    setIsReportOpen(false);
    setSelectedReportReason("low quality");
    setCurrentStoryIndex((index) => index + 1);
  }

  function handleRestart() {
    setCurrentStoryIndex(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setScore(0);
    setIsReportOpen(false);
    setSelectedReportReason("low quality");
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
        vote: current[currentStory.id]?.vote === vote ? null : vote,
        reportedReason: current[currentStory.id]?.reportedReason,
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
        vote: current[currentStory.id]?.vote ?? null,
        reportedReason: reason,
      },
    }));
  }

  function handleReportSubmit() {
    handleReport(selectedReportReason);
    setIsReportOpen(false);
  }

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
            href="/leaderboard"
            className="rounded-md px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark-muted)] transition-colors duration-150 hover:bg-[rgba(250,246,239,0.04)] hover:text-[var(--text-on-dark)]"
          >
            Leaderboard
          </Link>
          <Link
            href="/submit"
            className="rounded-md px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark-muted)] transition-colors duration-150 hover:bg-[rgba(250,246,239,0.04)] hover:text-[var(--text-on-dark)]"
          >
            Submit
          </Link>
        </nav>

        <div className="justify-self-end flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-on-dark-muted)]">
            Score
          </span>
          <span className="text-xl font-bold leading-none text-[var(--accent-gold)]">
            {score}
          </span>
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-56px)] items-center justify-center px-6 py-12 lg:px-12 lg:py-16">
        {totalStories === 0 ? (
          <section className="motion-card-enter surface-card w-full max-w-[640px] px-10 py-10">
            <h1 className="font-serif text-[32px] leading-[1.18] tracking-[-0.02em] text-[var(--text-primary)]">
              No stories available.
            </h1>
            <p className="mt-4 text-base leading-[1.65] text-[var(--text-secondary)]">
              Add entries to the local mock dataset and the game screen will start
              working again immediately.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/submit" className="button-primary">
                Submit story
              </Link>
              <Link href="/leaderboard" className="button-subtle">
                Leaderboard
              </Link>
            </div>
          </section>
        ) : isCompleted ? (
          <section className="motion-card-enter surface-card w-full max-w-[760px] px-10 py-10">
            <span className="inline-block rounded-md bg-[rgba(76,160,96,0.12)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#3d8b4f]">
              Round complete
            </span>
            <h1 className="mt-5 font-serif text-[36px] leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)]">
              Final score: {score}/{totalStories}
            </h1>
            <p className="mt-4 max-w-[32rem] text-base leading-[1.65] text-[var(--text-secondary)]">
              {performanceMessage} You finished with {percentageCorrect}% accuracy.
            </p>

            <div className="mt-8 grid gap-3">
              {answerHistory.length ? (
                answerHistory.map((item) => (
                  <div
                    key={item.storyId}
                    className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          You chose {item.userAnswer}. Correct answer: {item.correctAnswer}.
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-md px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.04em]",
                          item.isCorrect
                            ? "bg-[rgba(76,160,96,0.12)] text-[#3d8b4f]"
                            : "bg-[rgba(190,60,50,0.12)] text-[#b84233]",
                        ].join(" ")}
                      >
                        {item.isCorrect ? "Correct" : "Miss"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-6 py-8 text-center">
                  <p className="text-base text-[var(--text-secondary)]">
                    No review history was retained for this round.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button type="button" onClick={handleRestart} className="button-primary">
                Play again
              </button>
              <Link href="/leaderboard" className="button-subtle">
                Leaderboard
              </Link>
              <Link href="/submit" className="button-subtle">
                Submit
              </Link>
            </div>
          </section>
        ) : (
          <StoryCard key={currentStory.id} story={currentStory}>
            <GuessButtons
              disabled={isRevealed}
              selectedAnswer={selectedAnswer}
              correctAnswer={isRevealed ? currentStory.answer : undefined}
              onGuess={handleGuess}
            />

            <div
              className={[
                "overflow-hidden transition-[max-height,opacity] duration-[450ms]",
                isRevealed ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="pt-6">
                <div className="mb-5 h-px w-full bg-[var(--border-card)]" />

                <div className="flex items-start justify-between gap-4">
                  <span
                    className={[
                      "inline-block rounded-md px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.04em]",
                      selectedAnswer === currentStory.answer
                        ? "bg-[rgba(76,160,96,0.12)] text-[#3d8b4f]"
                        : "bg-[rgba(190,60,50,0.12)] text-[#b84233]",
                    ].join(" ")}
                  >
                    {selectedAnswer === currentStory.answer
                      ? `Correct - This was a ${currentStory.answer}`
                      : `Incorrect - This was a ${currentStory.answer}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsReportOpen((open) => !open)}
                    aria-pressed={Boolean(currentStoryFeedback.reportedReason) || isReportOpen}
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
                      currentStoryFeedback.reportedReason || isReportOpen
                        ? "border-[rgba(26,23,20,0.12)] bg-[var(--text-primary)] text-[var(--bg-card)]"
                        : "border-[var(--border-card)] bg-[rgba(255,255,255,0.62)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.9)]",
                    ].join(" ")}
                  >
                    <FlagIcon />
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-5">
                  <p className="flex-1 text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                    {currentStory.revealText}
                  </p>

                  <div className="flex shrink-0 flex-col items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleVoteChange("upvote")}
                      aria-pressed={currentStoryFeedback.vote === "upvote"}
                      className={[
                        "inline-flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
                        currentStoryFeedback.vote === "upvote"
                          ? "border-[rgba(184,114,45,0.24)] bg-[rgba(184,114,45,0.12)] text-[var(--accent-real)]"
                          : "border-[var(--border-card)] bg-[rgba(255,255,255,0.62)] text-[var(--text-muted)] hover:text-[var(--accent-real)]",
                      ].join(" ")}
                    >
                      <VoteArrowIcon direction="up" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVoteChange("downvote")}
                      aria-pressed={currentStoryFeedback.vote === "downvote"}
                      className={[
                        "inline-flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
                        currentStoryFeedback.vote === "downvote"
                          ? "border-[rgba(59,79,122,0.24)] bg-[rgba(59,79,122,0.1)] text-[var(--accent-dream)]"
                          : "border-[var(--border-card)] bg-[rgba(255,255,255,0.62)] text-[var(--text-muted)] hover:text-[var(--accent-dream)]",
                      ].join(" ")}
                    >
                      <VoteArrowIcon direction="down" />
                    </button>
                  </div>
                </div>

                {currentStoryFeedback.reportedReason ? (
                  <div className="mt-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]">
                    Report saved in the demo as{" "}
                    <span className="font-semibold text-[var(--text-primary)]">
                      {currentStoryFeedback.reportedReason}
                    </span>.
                  </div>
                ) : null}

                {isReportOpen && !currentStoryFeedback.reportedReason ? (
                  <div className="motion-panel-enter mt-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Report reason
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["inappropriate", "suspected troll", "low quality"] as const).map(
                        (reason) => {
                          const isSelected = selectedReportReason === reason;

                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setSelectedReportReason(reason)}
                              className={[
                                "rounded-md border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card-reveal)]",
                                isSelected
                                  ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-card)]"
                                  : "border-[var(--border-card)] bg-[rgba(255,255,255,0.65)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                              ].join(" ")}
                            >
                              {reason}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleReportSubmit}
                        className="button-subtle"
                      >
                        Send report
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReportOpen(false)}
                        className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card-reveal)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleNextStory}
                  className="mt-6 inline-flex items-center gap-1 bg-transparent p-0 text-sm font-semibold text-[var(--accent-gold)] transition-opacity duration-150 hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
                >
                  {currentStoryIndex === totalStories - 1 ? "See Results" : "Next Story"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </StoryCard>
        )}
      </main>
    </div>
  );
}
