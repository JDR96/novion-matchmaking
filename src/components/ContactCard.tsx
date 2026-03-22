"use client";

import { ContactResult } from "@/types/contact";
import ScoreBar from "./ScoreBar";

interface ContactCardProps {
  contact: ContactResult;
  rank: number;
}

export default function ContactCard({ contact, rank }: ContactCardProps) {
  const initials = contact.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article
      className="animate-fade-in group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
      style={{ animationDelay: `${rank * 60}ms` }}
      data-testid={`card-contact-${contact.id}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name + Org row */}
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[15px] font-semibold text-foreground">
              {contact.full_name}
            </h3>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              #{rank}
            </span>
          </div>

          {/* Role + Organization */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
            {contact.job_title && <span>{contact.job_title}</span>}
            {contact.job_title && contact.organization && (
              <span className="text-border">·</span>
            )}
            {contact.organization && (
              <span className="font-medium text-foreground/70">
                {contact.organization}
              </span>
            )}
          </div>

          {/* Score bar */}
          <div className="mt-3">
            <ScoreBar score={contact.match_score} />
          </div>

          {/* Labels */}
          {contact.labels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {contact.labels.map((label, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Motivation */}
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
            {contact.motivation}
          </p>
        </div>
      </div>
    </article>
  );
}
