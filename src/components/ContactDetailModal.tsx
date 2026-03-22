"use client";

import { useEffect, useState, useCallback } from "react";

interface ContactDetail {
  id: number;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  organization: string | null;
  job_title: string | null;
  email_1: string | null;
  email_2: string | null;
  phone_1: string | null;
  phone_2: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  sector: string | null;
  tags: string | null;
  linkedin_url: string | null;
  linkedin_searched: boolean;
  source: string | null;
  quality_score: number | null;
  function_level: string | null;
  expertise: string | null;
  suriname_score: number | null;
  bio: string | null;
  notes: string | null;
}

interface ContactDetailModalProps {
  contactId: number | null;
  onClose: () => void;
}

export default function ContactDetailModal({
  contactId,
  onClose,
}: ContactDetailModalProps) {
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (!res.ok) throw new Error("Contact niet gevonden.");
      const data = await res.json();
      setContact(data.contact);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Er ging iets mis."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (contactId) {
      fetchContact(contactId);
    } else {
      setContact(null);
    }
  }, [contactId, fetchContact]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!contactId) return null;

  const hasSuriname =
    contact?.suriname_score !== null &&
    contact?.suriname_score !== undefined &&
    contact.suriname_score >= 0.6;

  // Parse tags into readable array
  const tagList = contact?.tags
    ? contact.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-testid="modal-backdrop"
    >
      {/* Modal */}
      <div className="relative mx-4 w-full max-w-lg animate-fade-in overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          data-testid="button-close-modal"
          aria-label="Sluiten"
        >
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && contact && (
          <div className="max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-border px-6 pb-5 pt-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    hasSuriname
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {contact.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {contact.full_name}
                    </h2>
                    {contact.notes?.includes("[naam-opgeschoond]") && (
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
                        title={`Naam automatisch opgeschoond. ${contact.notes.replace("[naam-opgeschoond] ", "")}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </span>
                    )}
                    {contact.notes?.includes("[mogelijk-duplicaat]") && (
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                        title={contact.notes.replace("[mogelijk-duplicaat] ", "")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="8" height="10" x="2" y="4" rx="1" />
                          <rect width="8" height="10" x="14" y="10" rx="1" />
                          <path d="M10 4v10" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {contact.job_title && (
                    <p className="text-sm text-muted-foreground">
                      {contact.job_title}
                    </p>
                  )}
                  {contact.organization && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-muted-foreground"
                      >
                        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                        <path d="M9 22v-4h6v4" />
                        <path d="M8 6h.01" />
                        <path d="M16 6h.01" />
                        <path d="M12 6h.01" />
                        <path d="M12 10h.01" />
                        <path d="M12 14h.01" />
                        <path d="M16 10h.01" />
                        <path d="M16 14h.01" />
                        <path d="M8 10h.01" />
                        <path d="M8 14h.01" />
                      </svg>
                      <p className="text-sm font-medium text-foreground/80">
                        {contact.organization}
                      </p>
                    </div>
                  )}
                  {contact.city && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-muted-foreground"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <p className="text-xs text-muted-foreground">
                        {[contact.city, contact.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hasSuriname && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Suriname
                      </span>
                    )}
                    {contact.sector &&
                      contact.sector !== "Other" && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {contact.sector}
                        </span>
                      )}
                    {contact.function_level &&
                      contact.function_level !== "Other" && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {contact.function_level}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {contact.bio && (
              <div className="border-b border-border px-6 py-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {contact.bio}
                </p>
              </div>
            )}

            {/* Contact details */}
            <div className="border-b border-border px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contactgegevens
              </h3>
              <div className="space-y-2.5">
                {/* Emails */}
                {contact.email_1 && (
                  <DetailRow
                    icon="email"
                    label="Email"
                    value={contact.email_1}
                    href={`mailto:${contact.email_1}`}
                  />
                )}
                {contact.email_2 && contact.email_2 !== contact.email_1 && (
                  <DetailRow
                    icon="email"
                    label="Email 2"
                    value={contact.email_2}
                    href={`mailto:${contact.email_2}`}
                  />
                )}

                {/* Phones */}
                {contact.phone_1 && contact.phone_1.length > 3 && (
                  <DetailRow
                    icon="phone"
                    label="Telefoon"
                    value={contact.phone_1}
                    href={`tel:${contact.phone_1}`}
                  />
                )}
                {contact.phone_2 &&
                  contact.phone_2.length > 3 &&
                  contact.phone_2 !== contact.phone_1 && (
                    <DetailRow
                      icon="phone"
                      label="Telefoon 2"
                      value={contact.phone_2}
                      href={`tel:${contact.phone_2}`}
                    />
                  )}

                {/* LinkedIn */}
                {contact.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0077B5]/10 text-[#0077B5]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0077B5] transition-colors hover:underline"
                      >
                        LinkedIn profiel
                      </a>
                      {contact.linkedin_searched && (
                        <span
                          className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          title="Automatisch gezocht. Dit profiel is niet geverifieerd en kan onjuist zijn."
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          Niet geverifieerd
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                {contact.address && (
                  <DetailRow
                    icon="location"
                    label="Adres"
                    value={contact.address}
                  />
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {contact.expertise &&
                  contact.expertise !== "Other" && (
                    <MetaItem label="Expertise" value={contact.expertise} />
                  )}
                {contact.suriname_score !== null && (
                  <MetaItem
                    label="Suriname-score"
                    value={`${contact.suriname_score}`}
                  />
                )}
                {contact.quality_score !== null && (
                  <MetaItem
                    label="Kwaliteitsscore"
                    value={`${contact.quality_score}/100`}
                  />
                )}
                {contact.source && (
                  <MetaItem label="Bron" value={contact.source} />
                )}
              </div>

              {/* Tags */}
              {tagList.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tagList.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="mt-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Notities
                  </p>
                  <p className="text-sm text-foreground">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function DetailRow({
  icon,
  label,
  value,
  href,
}: {
  icon: "email" | "phone" | "location";
  label: string;
  value: string;
  href?: string;
}) {
  const iconMap = {
    email: (
      <svg
        width="14"
        height="14"
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
    ),
    phone: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    location: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  };

  const content = href ? (
    <a
      href={href}
      className="text-sm text-foreground transition-colors hover:text-primary"
    >
      {value}
    </a>
  ) : (
    <span className="text-sm text-foreground">{value}</span>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {iconMap[icon]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        {content}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
