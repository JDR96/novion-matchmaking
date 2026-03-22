"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  hero?: boolean;
  initialQuery?: string;
}

export default function SearchBar({
  hero = false,
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/zoeken?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div
        className={`relative flex items-center overflow-hidden rounded-2xl border bg-white shadow-[0_4px_20px_hsla(213,71%,13%,0.08)] transition-shadow focus-within:shadow-[0_8px_30px_hsla(213,71%,13%,0.15)] ${
          hero
            ? "h-14 border-white/20"
            : "h-12 border-border"
        }`}
      >
        <div className="pointer-events-none flex items-center pl-4 text-gold">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Beschrijf wie u zoekt, bijv. 'directeur in de energiesector'"
          className={`flex-1 bg-transparent px-3 text-navy placeholder:text-navy/30 focus:outline-none ${
            hero ? "text-[15px]" : "text-sm"
          }`}
          data-testid="input-search"
          autoFocus={hero}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="mr-2 flex h-9 items-center justify-center rounded-xl bg-navy px-5 text-[13px] font-medium text-white transition-all hover:bg-navy-light disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid="button-search"
        >
          Zoeken
        </button>
      </div>
    </form>
  );
}
