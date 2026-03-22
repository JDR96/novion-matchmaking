"use client";

import { ContactResult } from "@/types/contact";

interface ChatContactCardProps {
  contact: ContactResult;
  onSelect?: (id: number) => void;
}

export default function ChatContactCard({
  contact,
  onSelect,
}: ChatContactCardProps) {
  const initials = contact.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasSurinameRelevance =
    contact.suriname_score !== null && contact.suriname_score >= 0.6;

  return (
    <button
      type="button"
      className="w-full rounded-xl border border-border bg-white p-3.5 text-left shadow-[0_2px_8px_hsla(36,30%,50%,0.04)] transition-all hover:shadow-[0_4px_16px_hsla(36,30%,50%,0.1)] active:scale-[0.99]"
      onClick={() => onSelect?.(contact.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            hasSurinameRelevance
              ? "bg-[#1a6e74]/10 text-[#1a6e74]"
              : "bg-gold/10 text-gold-dark"
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name */}
          <div className="flex items-center gap-2">
            <span className="truncate font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-foreground">
              {contact.full_name}
            </span>
            {hasSurinameRelevance && (
              <span className="shrink-0 rounded-full bg-[#1a6e74]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#1a6e74]">
                Suriname
              </span>
            )}
          </div>

          {/* Role + Org */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            {contact.job_title && <span>{contact.job_title}</span>}
            {contact.job_title && contact.organization && (
              <span className="text-border">·</span>
            )}
            {contact.organization && (
              <span className="font-medium text-foreground/60">
                {contact.organization}
              </span>
            )}
          </div>

          {/* Location */}
          {contact.location && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{contact.location}</span>
            </div>
          )}

          {/* Score + labels row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-gold/10 px-2 py-0.5 font-mono text-[10px] font-medium text-gold-dark">
              {contact.match_score.toFixed(2)}
            </span>
            {contact.labels.slice(0, 3).map((label, i) => (
              <span
                key={i}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Contact links */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                title={contact.email}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="max-w-[120px] truncate">{contact.email}</span>
              </a>
            )}
            {contact.phone && contact.phone.length > 3 && (
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{contact.phone}</span>
              </a>
            )}
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-[#0077B5]"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
