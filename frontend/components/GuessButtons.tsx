import type { StoryAnswer } from "@/types/story";

const choices: Array<{
  label: string;
  value: StoryAnswer;
  tone: "dream" | "real";
}> = [
  {
    label: "Dream",
    value: "dream",
    tone: "dream",
  },
  {
    label: "Real",
    value: "real",
    tone: "real",
  },
];

type GuessButtonsProps = {
  disabled: boolean;
  selectedAnswer: StoryAnswer | null;
  correctAnswer?: StoryAnswer;
  onGuess: (answer: StoryAnswer) => void;
};

export function GuessButtons({
  disabled,
  selectedAnswer,
  correctAnswer,
  onGuess,
}: GuessButtonsProps) {
  return (
    <div className="flex gap-2.5 sm:gap-4">
      {choices.map((choice) => {
        const isSelected = selectedAnswer === choice.value;
        const isCorrect = correctAnswer === choice.value;
        const isRevealed = typeof correctAnswer !== "undefined";

        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onGuess(choice.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={[
              "flex min-h-[44px] flex-1 items-center justify-center rounded-lg border-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] text-white shadow-[var(--shadow-button)] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)] sm:min-h-[48px] sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm",
              disabled
                ? "cursor-default"
                : "hover:-translate-y-[1px] hover:shadow-[var(--shadow-button-hover)] active:translate-y-[1px] active:scale-[0.98]",
              choice.tone === "dream"
                ? "bg-[var(--accent-dream)] hover:bg-[var(--accent-dream-hover)]"
                : "bg-[var(--accent-real)] hover:bg-[var(--accent-real-hover)]",
              isRevealed && !isSelected && !isCorrect ? "opacity-35 shadow-none" : "",
              isSelected ? "ring-2 ring-white/20" : "",
            ].join(" ")}
          >
            <span>{choice.label}</span>
          </button>
        );
      })}
    </div>
  );
}
