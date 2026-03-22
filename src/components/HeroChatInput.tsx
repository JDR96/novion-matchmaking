"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HeroChatInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/zoeken?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <div className="relative flex h-14 items-center overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_20px_hsla(36,30%,50%,0.06)] transition-shadow focus-within:shadow-[0_8px_30px_hsla(36,30%,50%,0.12)]">
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Beschrijf wie u zoekt, bijv. 'directeur in de energiesector'"
          className="flex-1 bg-transparent px-3 text-[15px] text-foreground placeholder:text-foreground/25 focus:outline-none"
          data-testid="input-hero-chat"
          autoFocus
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="mr-2 flex h-9 items-center justify-center rounded-xl bg-foreground px-5 text-[13px] font-medium text-white transition-all hover:bg-foreground/85 disabled:opacity-30 disabled:cursor-not-allowed"
          data-testid="button-hero-chat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Vraag
        </button>
      </div>
    </form>
  );
}
