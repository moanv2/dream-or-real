"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { submitStory } from "@/lib/api";
import type { StoryAnswer } from "@/types/story";

type SubmissionForm = {
  title: string;
  storyText: string;
  answer: StoryAnswer;
  revealText: string;
};

const initialForm: SubmissionForm = {
  title: "",
  storyText: "",
  answer: "dream",
  revealText: "",
};

export default function SubmitPage() {
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);

  function handleChange<K extends keyof SubmissionForm>(
    field: K,
    value: SubmissionForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdStory = await submitStory({
        title: form.title.trim() || undefined,
        text: form.storyText.trim(),
        label: form.answer,
        reveal_text: form.revealText.trim() || undefined,
      });
      setSubmittedTitle(createdStory.title ?? "Untitled story");
      setForm(initialForm);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit story.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNewSubmission() {
    setForm(initialForm);
    setSubmittedTitle(null);
    setSubmitError(null);
  }

  return (
    <main className="app-page">
      <div className="app-frame">
        <section className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="pt-4">
            <p className="section-kicker">Submit</p>
            <h1 className="section-title mt-5">
              Send in your
              <br />
              strangest story.
            </h1>
            <p className="section-copy">
              Anonymous submissions go straight to the local database. Every entry is
              approved immediately and can show up in the play loop.
            </p>

            <div className="mt-8 space-y-4">
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Writing note
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  The best stories are concise, weird, and believable for at least five
                  seconds.
                </p>
              </div>
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Approval rule
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  No moderation queue. The backend assigns a comic image automatically.
                </p>
              </div>
            </div>
          </div>

          {submittedTitle ? (
            <section className="motion-card-enter surface-card">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-[var(--border-card)] p-8 lg:border-b-0 lg:border-r lg:p-10">
                  <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Saved
                  </span>
                  <h2 className="mt-6 font-serif text-[2.4rem] leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
                    Story added
                    <br />
                    to the game.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                    The backend stored your anonymous submission in SQLite and marked it
                    approved right away.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-5">
                      <p className="meta-label">Title</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        {submittedTitle}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-5">
                      <p className="meta-label">Status</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        Approved
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 lg:p-10">
                  <p className="meta-label">Next steps</p>
                  <div className="mt-5 rounded-2xl border border-[var(--border-card)] bg-[rgba(255,255,255,0.55)] p-5">
                    <p className="text-base leading-8 text-[var(--text-secondary)]">
                      Head back to the game and keep drawing random stories until your
                      submission appears.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button type="button" onClick={handleNewSubmission} className="button-subtle">
                      Submit another
                    </button>
                    <Link href="/" className="button-primary">
                      Back to play
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="motion-card-enter surface-card p-8 lg:p-10">
              <div>
                <div className="max-w-[34rem]">
                  <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Story form
                  </span>
                  <h2 className="mt-6 font-serif text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
                    Make it feel real enough to question.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                    Keep the title concise, write the story the way players will read it,
                    and label the answer honestly.
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="story-title" className="meta-label">
                      Story title
                    </label>
                    <input
                      id="story-title"
                      type="text"
                      value={form.title}
                      onChange={(event) => handleChange("title", event.target.value)}
                      placeholder="The Bird Outside Room 214"
                      className="field-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="story-text" className="meta-label">
                      Story text
                    </label>
                    <textarea
                      id="story-text"
                      value={form.storyText}
                      onChange={(event) => handleChange("storyText", event.target.value)}
                      placeholder="Write the short bizarre story exactly how you want players to read it."
                      className="field-input min-h-[220px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reveal-text" className="meta-label">
                      Reveal text
                    </label>
                    <textarea
                      id="reveal-text"
                      value={form.revealText}
                      onChange={(event) => handleChange("revealText", event.target.value)}
                      placeholder="Optional extra context for the reveal screen."
                      className="field-input min-h-[140px]"
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
                    <div>
                      <p className="meta-label">Answer label</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {(["dream", "real"] as const).map((option) => {
                          const isActive = form.answer === option;
                          const optionTone =
                            option === "dream"
                              ? "border-[rgba(59,79,122,0.2)] bg-[rgba(59,79,122,0.1)] text-[var(--accent-dream)]"
                              : "border-[rgba(184,114,45,0.2)] bg-[rgba(184,114,45,0.1)] text-[var(--accent-real)]";

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleChange("answer", option)}
                              className={[
                                "rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
                                isActive
                                  ? optionTone
                                  : "border-[var(--border-card)] bg-[rgba(255,255,255,0.55)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="panel-muted p-5">
                      <p className="meta-label">MVP rules</p>
                      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                        Text only. The backend derives preview text, stores the full
                        story, and assigns one of the existing comic assets.
                      </p>
                    </div>
                  </div>

                  {submitError ? (
                    <div className="rounded-2xl border border-[rgba(190,60,50,0.22)] bg-[rgba(190,60,50,0.08)] px-4 py-3 text-sm leading-7 text-[#8e2f25]">
                      {submitError}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" className="button-primary" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit story"}
                    </button>
                    <Link href="/" className="button-subtle">
                      Back to play
                    </Link>
                  </div>
                </form>
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
