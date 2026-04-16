type ProgressBarProps = {
  current: number;
  total: number;
  completed?: boolean;
};

export function ProgressBar({ current, total, completed = false }: ProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const progress = Math.min((current / safeTotal) * 100, 100);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-tight text-slate-700">
          {completed ? "Round Complete" : `Story ${current} of ${total}`}
        </span>
        <span className="chip-soft">
          {current}/{total}
        </span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-slate-200/90 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#ff8a5b_0%,#ffad73_100%)] shadow-[0_4px_10px_rgba(255,138,91,0.3)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
