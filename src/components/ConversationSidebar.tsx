"use client";

import { useEffect, useState, useCallback } from "react";

interface ConversationItem {
  id: string;
  title: string;
  updated_at: string;
  preview: string | null;
}

interface ConversationSidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  refreshKey: number;
}

function groupConversations(conversations: ConversationItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: ConversationItem[] }[] = [
    { label: "Vandaag", items: [] },
    { label: "Gisteren", items: [] },
    { label: "Deze week", items: [] },
    { label: "Eerder", items: [] },
  ];

  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    if (d >= today) {
      groups[0].items.push(conv);
    } else if (d >= yesterday) {
      groups[1].items.push(conv);
    } else if (d >= weekAgo) {
      groups[2].items.push(conv);
    } else {
      groups[3].items.push(conv);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "zojuist";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} uur`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "dag" : "dagen"}`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weken"}`;
}

export default function ConversationSidebar({
  activeId,
  onSelect,
  onNew,
  onDelete,
  refreshKey,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [tableExists, setTableExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      setTableExists(data.tableExists !== false);
      setConversations(data.conversations || []);
    } catch {
      // Silent fail — chat still works
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshKey]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        onDelete(id);
      }
    } catch {
      // Silent fail
    } finally {
      setDeletingId(null);
    }
  }

  const groups = groupConversations(conversations);

  // Sidebar content shared between desktop and mobile
  const sidebarContent = (
    <>
      {/* New conversation button */}
      <button
        onClick={() => {
          onNew();
          setMobileOpen(false);
        }}
        className="mx-3 mt-3 mb-2 flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
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
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nieuw gesprek
      </button>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading ? (
          <div className="space-y-2 px-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-10 rounded-lg" />
            ))}
          </div>
        ) : !tableExists ? (
          <div className="mx-2 mt-4 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-1 font-medium text-foreground/70">
              Gespreksgeschiedenis is nog niet ingesteld
            </p>
            <p>
              Voer het SQL-script uit om de tabellen{" "}
              <code className="rounded bg-muted px-1 font-mono text-[11px]">
                conversations
              </code>{" "}
              en{" "}
              <code className="rounded bg-muted px-1 font-mono text-[11px]">
                messages
              </code>{" "}
              aan te maken.
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-3 pt-4 text-xs text-muted-foreground">
            Nog geen gesprekken
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    setMobileOpen(false);
                  }}
                  className={`group relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    conv.id === activeId
                      ? "bg-gold/15 text-foreground"
                      : "text-foreground/70 hover:bg-surface-hover"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium leading-snug">
                      {conv.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(conv.updated_at)}
                    </p>
                  </div>
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-border hover:text-foreground group-hover:opacity-100"
                    aria-label="Verwijder gesprek"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-[4.5rem] z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white shadow-sm transition-colors hover:bg-surface md:hidden"
        aria-label="Open gesprekken"
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
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border bg-cream transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Gesprekken
          </h2>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover"
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
        </div>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden h-full flex-col border-r border-border bg-cream transition-all duration-200 md:flex ${
          collapsed ? "w-0 overflow-hidden" : "w-[280px]"
        }`}
      >
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Gesprekken
          </h2>
          <button
            onClick={() => setCollapsed(true)}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover"
            aria-label="Sidebar inklappen"
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
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </div>

      {/* Collapsed expand button (desktop) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden h-full w-10 items-center justify-center border-r border-border bg-cream text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground md:flex"
          aria-label="Sidebar uitklappen"
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
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </>
  );
}
