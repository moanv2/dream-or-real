"use client";

import { useEffect, useState } from "react";
import { AccuracyKpi } from "@/components/analytics/AccuracyKpi";
import { DreamLexicon, type LexiconWord } from "@/components/analytics/DreamLexicon";
import { LabelAccuracySplit } from "@/components/analytics/LabelAccuracySplit";
import { StoryLengthShowdown, type LengthBucket } from "@/components/analytics/StoryLengthShowdown";
import { TrickiestStories } from "@/components/analytics/TrickiestStories";
import { TricksterLeaderboard, type TricksterEntry } from "@/components/analytics/TricksterLeaderboard";

type LabelStat = { correct: number; total: number; pct: number };

type DashboardPayload = {
  overall_accuracy: LabelStat;
  label_accuracy: { dream: LabelStat; real: LabelStat };
  trickiest_stories: Array<{
    id: number;
    title: string;
    label: "dream" | "real";
    plays: number;
    correct_pct: number;
  }>;
};

type ExtrasPayload = {
  trickster: { entries: TricksterEntry[]; has_data: boolean };
  lexicon: {
    dreamy_words: LexiconWord[];
    real_words: LexiconWord[];
    has_data: boolean;
  };
  length_showdown: {
    buckets: LengthBucket[];
    dream_avg_words: number;
    real_avg_words: number;
    has_data: boolean;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [extras, setExtras] = useState<ExtrasPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [dashRes, extrasRes] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/dashboard`),
          fetch(`${API_BASE}/api/analytics/extras`),
        ]);
        if (!dashRes.ok) throw new Error(`dashboard HTTP ${dashRes.status}`);
        if (!extrasRes.ok) throw new Error(`extras HTTP ${extrasRes.status}`);
        const dash = (await dashRes.json()) as DashboardPayload;
        const ext = (await extrasRes.json()) as ExtrasPayload;
        if (!cancelled) {
          setDashboard(dash);
          setExtras(ext);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load analytics.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative mx-auto w-full max-w-[1200px] px-6 py-10 lg:px-12 lg:py-14">
      {/* Decorative backdrop — gives the glass cards something to diffract */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -left-24 top-10 h-[340px] w-[340px] rounded-full opacity-[0.22] blur-[90px]"
          style={{ background: "var(--accent-dream)" }}
        />
        <div
          className="absolute right-[-80px] top-[220px] h-[380px] w-[380px] rounded-full opacity-[0.20] blur-[100px]"
          style={{ background: "var(--accent-real)" }}
        />
        <div
          className="absolute left-[40%] bottom-[-60px] h-[300px] w-[300px] rounded-full opacity-[0.14] blur-[90px]"
          style={{ background: "var(--accent-gold)" }}
        />
      </div>

      <header className="mb-10">
        <p className="meta-label">Dashboard</p>
        <h1 className="section-title mt-2">Analytics</h1>
        <p className="section-copy">How well players distinguish dreams from reality.</p>
      </header>

      {error ? (
        <div className="mb-6 rounded-xl border border-[rgba(184,66,51,0.4)] bg-[rgba(184,66,51,0.08)] px-5 py-4 text-sm text-[var(--text-on-dark)]">
          Couldn&apos;t load analytics: {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AccuracyKpi
          correct={dashboard?.overall_accuracy.correct ?? 0}
          total={dashboard?.overall_accuracy.total ?? 0}
          pct={dashboard?.overall_accuracy.pct ?? 0}
        />
        <LabelAccuracySplit
          dream={dashboard?.label_accuracy.dream ?? { correct: 0, total: 0, pct: 0 }}
          real={dashboard?.label_accuracy.real ?? { correct: 0, total: 0, pct: 0 }}
        />
        <TrickiestStories stories={dashboard?.trickiest_stories ?? []} />
        <TricksterLeaderboard entries={extras?.trickster.entries ?? []} />
        <DreamLexicon
          dreamyWords={extras?.lexicon.dreamy_words ?? []}
          realWords={extras?.lexicon.real_words ?? []}
          hasData={extras?.lexicon.has_data ?? false}
        />
        <StoryLengthShowdown
          buckets={extras?.length_showdown.buckets ?? []}
          dreamAvg={extras?.length_showdown.dream_avg_words ?? 0}
          realAvg={extras?.length_showdown.real_avg_words ?? 0}
          hasData={extras?.length_showdown.has_data ?? false}
        />
      </div>

      {isLoading && !dashboard ? (
        <p className="mt-6 text-xs uppercase tracking-[0.12em] text-[var(--text-on-dark-muted)]">
          Loading...
        </p>
      ) : null}
    </main>
  );
}
