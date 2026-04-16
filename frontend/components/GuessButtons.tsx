import type { StoryAnswer } from "@/types/story";

const choices: Array<{
  label: string;
  value: StoryAnswer;
  hint: string;
}> = [
  {
    label: "Dream",
    value: "dream",
    hint: "wild, symbolic, impossible",
  },
  {
    label: "Real",
    value: "real",
    hint: "strange, but it actually happened",
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
    <div className="grid grid-cols-2 gap-4">
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
              "group relative overflow-hidden rounded-[1.75rem] border px-6 py-5 text-left shadow-sm transition-all duration-300 ease-out will-change-transform",
              disabled
                ? "cursor-default"
                : "hover:-translate-y-1 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:scale-[0.995]",
              isSelected
                ? isCorrect
                  ? "border-emerald-300 bg-emerald-50/90 shadow-md"
                  : "border-rose-300 bg-rose-50/90 shadow-md"
                : isCorrect
                  ? "border-emerald-300 bg-emerald-50/90 shadow-md"
                  : "border-slate-200 bg-white/95",
            ].join(" ")}
          >
            <div
              className={[
                "absolute inset-x-0 top-0 h-1 transition-opacity duration-300",
                isSelected
                  ? isCorrect
                    ? "bg-emerald-500 opacity-100"
                    : "bg-rose-400 opacity-100"
                  : isRevealed && isCorrect
                    ? "bg-emerald-500 opacity-100"
                    : "bg-transparent opacity-0",
              ].join(" ")}
            />
            <div
              className={[
                "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)] opacity-0 transition-opacity duration-300",
                disabled ? "" : "group-hover:opacity-100",
              ].join(" ")}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-0.5">
                  {choice.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500 transition-colors duration-300 group-hover:text-slate-700">
                  {choice.hint}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition-all duration-300 group-hover:bg-slate-200/80">
                  {choice.label}
                </span>
                {isSelected ? (
                  <span className="motion-panel-enter rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Your pick
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
