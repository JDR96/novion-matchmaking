"use client";

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const percentage = Math.round(score * 100);
  const width = Math.max(percentage, 2);

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-score-bg"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Match score: ${percentage}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${width}%`,
            background: "linear-gradient(90deg, #d7b878 0%, #c9a463 40%, #a67c3f 100%)",
          }}
        />
      </div>
      <span className="w-11 text-right font-mono text-xs font-medium text-muted-foreground tabular-nums">
        {score.toFixed(2)}
      </span>
    </div>
  );
}
