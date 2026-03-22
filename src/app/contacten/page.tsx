"use client";

import { useEffect, useState, useCallback } from "react";
import ErrorState from "@/components/ErrorState";
import ContactDetailModal from "@/components/ContactDetailModal";

interface Contact {
  id: number;
  full_name: string;
  organization: string | null;
  job_title: string | null;
  sector: string | null;
  expertise: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
  function_level: string | null;
  suriname_score: number | null;
  source: string | null;
}

interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZES = [25, 50, 100] as const;

export default function ContactenPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort: "volledige_naam",
        order: "asc",
      });
      if (search) params.set("search", search);
      if (sectorFilter) params.set("sector", sectorFilter);

      const response = await fetch(`/api/contacts?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Fout bij het ophalen van contacten.");
      }

      const data: ContactsResponse = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Er ging iets mis."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sectorFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleSectorChange(sector: string) {
    setPage(1);
    setSectorFilter(sector);
  }

  function handleLimitChange(newLimit: number) {
    setPage(1);
    setLimit(newLimit);
  }

  const sectors = [
    "Technology",
    "Engineering",
    "Maritime",
    "Finance",
    "Energy",
    "Government",
    "Legal",
    "Consulting",
    "Agriculture",
    "Real Estate",
    "Healthcare",
    "Media",
    "Telecom",
    "Mining",
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          Alle contacten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total.toLocaleString("nl-NL")} contacten in de database
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Text search */}
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                width="15"
                height="15"
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Zoek op naam, organisatie, functie..."
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              data-testid="input-contacts-search"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
            data-testid="button-contacts-search"
          >
            Zoeken
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-testid="button-clear-search"
            >
              Wissen
            </button>
          )}
        </form>

        {/* Sector filter */}
        <select
          value={sectorFilter}
          onChange={(e) => handleSectorChange(e.target.value)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          data-testid="select-sector"
        >
          <option value="">Alle sectoren</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-14 w-full rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <ErrorState message={error} onRetry={fetchContacts} />
      )}

      {/* Table */}
      {!isLoading && !error && contacts.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm" data-testid="contacts-table">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Naam
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">
                    Organisatie
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                    Functie
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                    Sector
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                    Locatie
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Links
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                    data-testid={`row-contact-${contact.id}`}
                    onClick={() => setSelectedContactId(contact.id)}
                  >
                    {/* Name + mobile details */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {contact.full_name}
                      </div>
                      {/* Mobile: show org below name */}
                      <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                        {contact.organization || ""}
                        {contact.organization && contact.job_title && " · "}
                        {contact.job_title || ""}
                      </div>
                      {contact.suriname_score !== null &&
                        contact.suriname_score >= 0.6 && (
                          <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Suriname
                          </span>
                        )}
                    </td>
                    {/* Organization */}
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {contact.organization || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    {/* Job title */}
                    <td className="hidden max-w-[200px] truncate px-4 py-3 text-muted-foreground md:table-cell">
                      {contact.job_title || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    {/* Sector */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {contact.sector && contact.sector !== "Other" ? (
                        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {contact.sector.split(",")[0].trim()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    {/* Location */}
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {contact.location || (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    {/* Action links */}
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            title={contact.email}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
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
                              <rect
                                width="20"
                                height="16"
                                x="2"
                                y="4"
                                rx="2"
                              />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </a>
                        )}
                        {contact.phone && contact.phone.length > 3 && (
                          <a
                            href={`tel:${contact.phone}`}
                            title={contact.phone}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
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
                          </a>
                        )}
                        {contact.linkedin_url && (
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn profiel"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#0077B5]/10 hover:text-[#0077B5]"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Per pagina:</span>
              <div className="flex rounded-lg border border-border bg-card">
                {PAGE_SIZES.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleLimitChange(opt)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                      limit === opt
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    data-testid={`button-pagesize-${opt}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Pagina {page} van {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-first-page"
              >
                Eerste
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-prev-page"
              >
                Vorige
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-next-page"
              >
                Volgende
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-last-page"
              >
                Laatste
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!isLoading && !error && contacts.length === 0 && (
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">
            Geen contacten gevonden
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Probeer een andere zoekterm of filter.
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
