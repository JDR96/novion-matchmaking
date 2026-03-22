"use client";

interface EmptyStateProps {
  query?: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center" data-testid="empty-state">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">
        Geen relevante contacten gevonden
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {query ? (
          <>
            Er zijn geen matches gevonden voor &ldquo;{query}&rdquo;. Probeer
            een bredere zoekterm.
          </>
        ) : (
          <>Voer een zoekopdracht in om relevante contacten te vinden.</>
        )}
      </p>
    </div>
  );
}
