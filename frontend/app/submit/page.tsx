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
    <main className="min-h-screen bg-mist px-6 py-10 text-ink lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 max-w-[46rem]">
          <p className="mb-4 inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
            Submit
          </p>
          <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3.7rem]">
            Send in your strangest story.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            This is a mocked frontend-only flow for the demo. Fill out the
            story, choose the answer label, and preview the kind of submission
            experience the product could grow into later.
          </p>
        </div>

        {isSubmitted ? (
          <section className="motion-card-enter overflow-hidden rounded-4xl border border-white/80 bg-paper/95 shadow-card backdrop-blur">
            <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
                <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                  Mock Success
                </span>
                <h2 className="mt-5 text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3rem]">
                  Story staged for review.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  Your submission did not go anywhere yet, but the UI now feels
                  like a real product flow. In a later version, this is where
                  moderation and persistence would plug in.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="motion-panel-enter rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/90 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Submitted As
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
                      {form.answer}
                    </p>
                  </div>
                  <div className="motion-panel-enter rounded-[1.75rem] bg-ink p-6 text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                      Image Slot
                    </p>
                    <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">
                      {form.imageName ? "Attached" : "No image"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={handleNewSubmission}
                    className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0"
                  >
                    Submit Another
                  </button>
                  <Link
                    href="/"
                    className="rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-ink hover:shadow-md active:translate-y-0"
                  >
                    Back to Play
                  </Link>
                </div>
              </div>

              <div className="p-9 lg:p-11">
                <div className="rounded-[1.9rem] border border-slate-200/90 bg-white/88 p-7 shadow-sm backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Submission Preview
                  </p>
                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Title
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-ink">
                        {form.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Story Text
                      </p>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {form.storyText}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Answer: {form.answer}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {form.imageName || "Image optional"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="motion-card-enter overflow-hidden rounded-4xl border border-white/80 bg-paper/95 shadow-card backdrop-blur">
            <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_transparent_42%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f8_100%)] p-9 lg:border-b-0 lg:border-r lg:p-11">
                <span className="motion-panel-enter rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                  Story Form
                </span>
                <h2 className="mt-5 text-[2.3rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-[3rem]">
                  Make it feel real enough to question.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                  Strong submissions are short, strange, and just believable
                  enough to make the reveal satisfying.
                </p>

                <div className="mt-8 grid gap-3 text-sm text-slate-600">
                  <div className="motion-panel-enter rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-slate-200/80">
                    Keep the title concise and intriguing.
                  </div>
                  <div className="motion-panel-enter rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-slate-200/80">
                    Write the story text like a clean card summary.
                  </div>
                  <div className="motion-panel-enter rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-slate-200/80">
                    Images are mocked for now, but the slot is ready in the UI.
                  </div>
                </div>
              </div>

              <div className="p-9 lg:p-11">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="story-title"
                      className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                    >
                      Story Title
                    </label>
                    <input
                      id="story-title"
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        handleChange("title", event.target.value)
                      }
                      placeholder="The Bird Outside Room 214"
                      className="mt-3 w-full rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3.5 text-base text-ink shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-300 focus:shadow-md"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="story-text"
                      className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                    >
                      Story Text
                    </label>
                    <textarea
                      id="story-text"
                      value={form.storyText}
                      onChange={(event) =>
                        handleChange("storyText", event.target.value)
                      }
                      placeholder="Write the short bizarre story exactly how you want players to read it."
                      className="mt-3 min-h-[220px] w-full rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3.5 text-base leading-7 text-ink shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-300 focus:shadow-md"
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Answer Label
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {(["dream", "real"] as const).map((option) => {
                          const isActive = form.answer === option;

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleChange("answer", option)}
                              className={[
                                "rounded-[1.25rem] border px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300",
                                isActive
                                  ? "border-ink bg-ink text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:text-ink hover:shadow-sm",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Optional Image
                      </label>
                      <label
                        htmlFor="story-image"
                        className="mt-3 flex min-h-[116px] cursor-pointer flex-col justify-between rounded-[1.35rem] border border-dashed border-slate-300 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {form.imageName
                              ? form.imageName
                              : "Choose a comic-style image"}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Visual placeholder only. Nothing uploads anywhere
                            yet.
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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

                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
                    <p className="text-sm leading-6 text-slate-500">
                      Frontend-only demo flow. The form looks real, but nothing
                      is sent yet.
                    </p>
                    <button
                      type="submit"
                      className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff7c49] hover:shadow-md active:translate-y-0"
                    >
                      Submit Story
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
