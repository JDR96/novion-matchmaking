"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import ContactCard from "@/components/ContactCard";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { ContactResult, SearchResponse } from "@/types/contact";
import ContactDetailModal from "@/components/ContactDetailModal";

const RESULT_OPTIONS = [10, 25, 50] as const;

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [results, setResults] = useState<ContactResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [resultLimit, setResultLimit] = useState<number>(10);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const executeSearch = useCallback(
    async (query: string, limit: number = 10) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setCurrentQuery(query);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: query.trim(), limit }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Fout (${response.status})`);
        }

        const data: SearchResponse = await response.json();
        setResults(data.results);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Er ging iets mis bij het ophalen van de resultaten."
        );
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (queryParam) {
      executeSearch(queryParam, resultLimit);
    }
  }, [queryParam, executeSearch, resultLimit]);

  function handleLimitChange(newLimit: number) {
    setResultLimit(newLimit);
    if (currentQuery) {
      executeSearch(currentQuery, newLimit);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar initialQuery={queryParam} />
      </div>

      {/* Results header with count selector */}
      {hasSearched && !isLoading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {results.length > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {results.length}
                </span>{" "}
                {results.length === 1 ? "resultaat" : "resultaten"} voor
                &ldquo;{currentQuery}&rdquo;
              </>
            ) : null}
          </p>

          {/* Result count selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Toon:</span>
            <div className="flex rounded-lg border border-border bg-card">
              {RESULT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleLimitChange(opt)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                    resultLimit === opt
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-testid={`button-limit-${opt}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4" data-testid="loading-state">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <ErrorState
          message={error}
          onRetry={() => executeSearch(currentQuery, resultLimit)}
        />
      )}

      {/* Empty state */}
      {!isLoading && !error && hasSearched && results.length === 0 && (
        <EmptyState query={currentQuery} />
      )}

      {/* Results */}
      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-3" data-testid="results-list">
          {results.map((contact, i) => (
            <ContactCard key={contact.id} contact={contact} rank={i + 1} onSelect={setSelectedContactId} />
          ))}
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center py-16 text-center">
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
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">
            Zoek in 17.500+ contacten
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Beschrijf in het Nederlands wie je zoekt. Het systeem vindt
            automatisch de meest relevante matches.
          </p>
        </div>
      )}
      {/* Contact detail modal */}
      <ContactDetailModal
        contactId={selectedContactId}
        onClose={() => setSelectedContactId(null)}
      />
    </div>
  );
}

export default function ZoekenPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          <div className="skeleton mb-6 h-12 w-full rounded-xl" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
