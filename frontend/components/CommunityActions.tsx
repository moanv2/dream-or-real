export type VoteValue = "upvote" | "downvote" | null;
export type ReportReason = "inappropriate" | "suspected troll" | "low quality";

type CommunityActionsProps = {
  vote: VoteValue;
  onVoteChange: (vote: VoteValue) => void;
};

function VoteArrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={[
        "h-3.5 w-3.5 fill-none stroke-current stroke-[1.7]",
        direction === "down" ? "rotate-180" : "",
      ].join(" ")}
    >
      <path d="M6 2.1 10 7.2H2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CommunityActions({
  vote,
  onVoteChange,
}: CommunityActionsProps) {
  function handleVote(nextVote: Exclude<VoteValue, null>) {
    onVoteChange(vote === nextVote ? null : nextVote);
  }

  return (
    <div className="border-t border-[var(--border-card)] pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Community feedback
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
        Lightweight demo moderation after the reveal.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={() => handleVote("upvote")}
          className={[
            "inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
            vote === "upvote"
              ? "text-[var(--accent-dream)]"
              : "hover:text-[var(--text-primary)]",
          ].join(" ")}
          aria-pressed={vote === "upvote"}
        >
          <span
            className={[
              "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors duration-150",
              vote === "upvote"
                ? "border-[rgba(59,79,122,0.26)] bg-[rgba(59,79,122,0.12)]"
                : "border-[var(--border-card)] bg-[var(--bg-card-reveal)]",
            ].join(" ")}
          >
            <VoteArrow direction="up" />
          </span>
          <span>Upvote</span>
        </button>

        <button
          type="button"
          onClick={() => handleVote("downvote")}
          className={[
            "inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]",
            vote === "downvote"
              ? "text-[var(--accent-real)]"
              : "hover:text-[var(--text-primary)]",
          ].join(" ")}
          aria-pressed={vote === "downvote"}
        >
          <span
            className={[
              "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors duration-150",
              vote === "downvote"
                ? "border-[rgba(184,114,45,0.26)] bg-[rgba(184,114,45,0.12)]"
                : "border-[var(--border-card)] bg-[var(--bg-card-reveal)]",
            ].join(" ")}
          >
            <VoteArrow direction="down" />
          </span>
          <span>Downvote</span>
        </button>
      </div>
    </div>
  );
}
