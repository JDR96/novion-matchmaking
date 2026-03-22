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

  const hasSurinameRelevance =
    contact.suriname_score !== null && contact.suriname_score >= 0.6;

  return (
    <article
      className="animate-fade-in group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
      style={{ animationDelay: `${rank * 60}ms` }}
      data-testid={`card-contact-${contact.id}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            hasSurinameRelevance
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name row */}
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-foreground">
              {contact.full_name}
            </h3>
            <span className="shrink-0 text-xs text-muted-foreground">
              #{rank}
            </span>
            {hasSurinameRelevance && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Suriname
              </span>
            )}
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

          {/* Location */}
          {contact.location && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                width="12"
                height="12"
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

          {/* Motivation / Bio */}
          <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
            {contact.motivation}
          </p>

          {/* Contact details bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
            {/* Email */}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                data-testid={`link-email-${contact.id}`}
                title={contact.email}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="max-w-[180px] truncate">{contact.email}</span>
              </a>
            )}

            {/* Phone */}
            {contact.phone &&
              contact.phone.length > 3 && (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  data-testid={`link-phone-${contact.id}`}
                  title={contact.phone}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{contact.phone}</span>
                </a>
              )}

            {/* LinkedIn */}
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-[#0077B5]/10 hover:text-[#0077B5]"
                data-testid={`link-linkedin-${contact.id}`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
