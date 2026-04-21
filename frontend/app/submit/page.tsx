"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { submitStory } from "@/lib/api";
import type { StoryAnswer, StorySubmissionResponse } from "@/types/story";

type SubmissionForm = {
  storyText: string;
  answer: StoryAnswer;
  attachments: File[];
};

const initialForm: SubmissionForm = {
  storyText: "",
  answer: "dream",
  attachments: [],
};

function outcomeLabel(result: StorySubmissionResponse): string {
  if (result.outcome === "approved") {
    return "Approved and Playable";
  }
  if (result.outcome === "rejected") {
    return "Rejected";
  }
  if (result.outcome === "needs_review") {
    return "Needs Review";
  }
  return "Partial Processing Failure";
}

export default function SubmitPage() {
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<StorySubmissionResponse | null>(null);

  function handleChange<K extends keyof SubmissionForm>(field: K, value: SubmissionForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionResult = await submitStory({
        text: form.storyText,
        label: form.answer,
        attachments: form.attachments,
      });
      setResult(submissionResult);
      setForm(initialForm);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit story.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNewSubmission() {
    setForm(initialForm);
    setResult(null);
    setSubmitError(null);
  }

  return (
    <main className="app-page">
      <div className="app-frame">
        <section className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="pt-4">
            <p className="section-kicker">Submit</p>
            <h1 className="section-title mt-5">
              Submit a story,
              <br />
              no account needed.
            </h1>
            <p className="section-copy">
              The backend stores your original text exactly, moderates it, rewrites a gameplay
              version, and tries to generate a comic if approved.
            </p>

            <div className="mt-8 space-y-4">
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Required
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  Story text and answer label (`dream` or `real`).
                </p>
              </div>
              <div className="panel-soft p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-on-dark-muted)]">
                  Optional
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  Image attachments (shown only after reveal).
                </p>
              </div>
            </div>
          </div>

          {result ? (
            <section className="motion-card-enter surface-card p-8 lg:p-10">
              <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Submission result
              </span>
              <h2 className="mt-6 font-serif text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
                {outcomeLabel(result)}
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">{result.message}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-5">
                  <p className="meta-label">Status</p>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    {result.story.status}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-5">
                  <p className="meta-label">Processing state</p>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    {result.story.processing_state ?? "n/a"}
                  </p>
                </div>
              </div>

              {result.story.moderation_reason ? (
                <div className="mt-5 rounded-2xl border border-[var(--border-card)] bg-white/70 p-5">
                  <p className="meta-label">Moderation note</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {result.story.moderation_reason}
                  </p>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={handleNewSubmission} className="button-subtle">
                  Submit another
                </button>
                <Link href="/" className="button-primary">
                  Back to play
                </Link>
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
                    Keep it weird, specific, and plausible for five seconds.
                  </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="story-text" className="meta-label">
                      Story text
                    </label>
                    <textarea
                      id="story-text"
                      value={form.storyText}
                      onChange={(event) => handleChange("storyText", event.target.value)}
                      placeholder="Write the original raw story submission here."
                      className="field-input min-h-[220px]"
                      required
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

                    <div className="space-y-2">
                      <label htmlFor="attachments" className="meta-label">
                        Optional attachments (images)
                      </label>
                      <input
                        id="attachments"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(event) =>
                          handleChange("attachments", Array.from(event.target.files ?? []))
                        }
                        className="field-input"
                      />
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
