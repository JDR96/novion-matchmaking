"use client";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center" data-testid="error-state">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">
        Er ging iets mis
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {message || "Er is een fout opgetreden bij het ophalen van de resultaten."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-all hover:brightness-110"
          data-testid="button-retry"
        >
          Opnieuw proberen
        </button>
      )}
    </div>
  );
}
