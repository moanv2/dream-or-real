"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import type { StoryAnswer } from "@/types/story";

type SubmissionForm = {
  title: string;
  storyText: string;
  answer: StoryAnswer;
  imageName: string;
};

const initialForm: SubmissionForm = {
  title: "",
  storyText: "",
  answer: "dream",
  imageName: "",
};

export default function SubmitPage() {
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange<K extends keyof SubmissionForm>(
    field: K,
    value: SubmissionForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    handleChange("imageName", file?.name ?? "");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  function handleNewSubmission() {
    setForm(initialForm);
    setIsSubmitted(false);
  }

  return (
    <main className="app-page">
      <div className="app-frame">
        <section className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="pt-4">
            <p className="section-kicker">Submit</p>
            <h1 className="section-title mt-5">
              Send in your
              <br />
              strangest story.
            </h1>
            <p className="section-copy">
              Frontend-only for now. Enough structure to feel real, without pretending
              anything is actually being moderated yet.
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
                  Image slot
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-on-dark-muted)]">
                  Still mocked. The page just needs to feel ready for the next step.
                </p>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <section className="motion-card-enter surface-card">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-[var(--border-card)] p-8 lg:border-b-0 lg:border-r lg:p-10">
                  <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Mock success
                  </span>
                  <h2 className="mt-6 font-serif text-[2.4rem] leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)]">
                    Story staged
                    <br />
                    for review.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                    Nothing was sent anywhere, but the submission flow now behaves like
                    a real product surface.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card-reveal)] p-5">
                      <p className="meta-label">Submitted as</p>
                      <p className="mt-3 text-2xl font-semibold capitalize text-[var(--text-primary)]">
                        {form.answer}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[rgba(201,168,76,0.28)] bg-[rgba(201,168,76,0.12)] p-5">
                      <p className="meta-label">Image slot</p>
                      <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                        {form.imageName ? "Attached" : "No image"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button type="button" onClick={handleNewSubmission} className="button-primary">
                      Submit another
                    </button>
                    <Link href="/" className="button-subtle">
                      Back to play
                    </Link>
                  </div>
                </div>

                <div className="p-8 lg:p-10">
                  <p className="meta-label">Submission preview</p>
                  <div className="mt-6 space-y-5 rounded-xl border border-[var(--border-card)] bg-[rgba(255,255,255,0.55)] p-6">
                    <div>
                      <p className="meta-label">Title</p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        {form.title || "Untitled story"}
                      </p>
                    </div>
                    <div>
                      <p className="meta-label">Story text</p>
                      <p className="mt-2 text-base leading-8 text-[var(--text-secondary)]">
                        {form.storyText ||
                          "The story text preview will appear here after submission."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-2.5 py-1">
                        Answer: {form.answer}
                      </span>
                      <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-2.5 py-1">
                        {form.imageName || "Image optional"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="motion-card-enter surface-card p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <span className="rounded-md border border-[var(--border-card)] bg-[var(--bg-card-reveal)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Story form
                  </span>
                  <h2 className="mt-6 font-serif text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
                    Make it feel real
                    <br />
                    enough to question.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                    Keep the title concise, write the story the way players will read
                    it, and label the answer honestly.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                      required
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

                  <div className="grid gap-6 md:grid-cols-2">
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
                                  : "border-[var(--border-card)] bg-[rgba(255,255,255,0.55)] text-[var(--text-secondary)] hover:border-[rgba(26,23,20,0.18)] hover:text-[var(--text-primary)]",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="meta-label">Optional image</label>
                      <label
                        htmlFor="story-image"
                        className="mt-3 flex min-h-[120px] cursor-pointer flex-col justify-between rounded-xl border border-dashed border-[rgba(107,101,96,0.28)] bg-[rgba(255,255,255,0.55)] px-4 py-4 transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(26,23,20,0.18)]"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {form.imageName ? form.imageName : "Choose a comic-style image"}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                            Visual placeholder only. Nothing uploads anywhere yet.
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          Mock file input
                        </span>
                      </label>
                      <input
                        id="story-image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-card)] pt-6">
                    <p className="max-w-[24rem] text-sm leading-7 text-[var(--text-secondary)]">
                      Frontend-only demo flow. The form looks real, but nothing is sent.
                    </p>
                    <button type="submit" className="button-primary">
                      Submit story
                    </button>
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
