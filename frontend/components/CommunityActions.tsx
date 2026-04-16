import { useState } from "react";

export type VoteValue = "upvote" | "downvote" | null;
export type ReportReason = "inappropriate" | "suspected troll" | "low quality";

type CommunityActionsProps = {
  vote: VoteValue;
  reportedReason?: ReportReason;
  onVoteChange: (vote: VoteValue) => void;
  onReport: (reason: ReportReason) => void;
};

const reportReasons: ReportReason[] = [
  "inappropriate",
  "suspected troll",
  "low quality",
];

export function CommunityActions({
  vote,
  reportedReason,
  onVoteChange,
  onReport,
}: CommunityActionsProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] =
    useState<ReportReason>("low quality");

  function handleVote(nextVote: Exclude<VoteValue, null>) {
    onVoteChange(vote === nextVote ? null : nextVote);
  }

  function handleReportSubmit() {
    onReport(selectedReason);
    setIsReportOpen(false);
  }

  return (
    <div className="panel-soft rounded-[1.5rem] p-4 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="meta-label">
            Community Feedback
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Quick signals for story quality and moderation.
          </p>
        </div>

        {reportedReason ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-200">
            Reported
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleVote("upvote")}
          className={[
            "button-subtle",
            vote === "upvote"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
              : "",
          ].join(" ")}
          aria-pressed={vote === "upvote"}
        >
          Upvote
        </button>

        <button
          type="button"
          onClick={() => handleVote("downvote")}
          className={[
            "button-subtle",
            vote === "downvote"
              ? "border-rose-300 bg-rose-50 text-rose-700 shadow-sm"
              : "",
          ].join(" ")}
          aria-pressed={vote === "downvote"}
        >
          Downvote
        </button>

        <button
          type="button"
          onClick={() => setIsReportOpen((open) => !open)}
          className={[
            "button-subtle",
            isReportOpen || reportedReason
              ? "border-amber-300 bg-amber-50 text-amber-700 shadow-sm"
              : "",
          ].join(" ")}
          aria-expanded={isReportOpen}
        >
          {reportedReason ? "Report Sent" : "Report"}
        </button>
      </div>

      {reportedReason ? (
        <div className="motion-panel-enter mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200/80">
          Thanks. This story was marked as{" "}
          <span className="font-semibold text-ink">{reportedReason}</span> in
          the demo UI.
        </div>
      ) : null}

      {isReportOpen && !reportedReason ? (
        <div className="panel-muted motion-panel-enter mt-4 p-4">
          <p className="meta-label">
            Report Reason
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {reportReasons.map((reason) => {
              const isSelected = selectedReason === reason;

              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={[
                    "rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2",
                    isSelected
                      ? "border-ink bg-ink text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-ink",
                  ].join(" ")}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReportSubmit}
              className="button-base bg-ink px-4 py-2 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              Send Report
            </button>
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="button-subtle"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
