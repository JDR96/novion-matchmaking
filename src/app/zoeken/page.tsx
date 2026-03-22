"use client";

import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  Suspense,
  FormEvent,
} from "react";
import ChatContactCard from "@/components/ChatContactCard";
import ContactDetailModal from "@/components/ContactDetailModal";
import { ContactResult } from "@/types/contact";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  contacts?: ContactResult[];
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welkom bij Novion Matchmaking! Ik help u de juiste contacten te vinden uit ons netwerk van 17.500+ professionals.\n\nBeschrijf wie u zoekt — bijvoorbeeld een sector, functie, expertise of regio — en ik zoek de beste matches voor u. Hoe specifieker uw vraag, hoe beter de resultaten.",
};

function parseContactsFromContent(content: string): {
  textContent: string;
  contacts: ContactResult[];
} {
  const contacts: ContactResult[] = [];
  let textContent = content;

  const contactRegex =
    /<!--CONTACTS_START-->\s*([\s\S]*?)\s*<!--CONTACTS_END-->/g;
  let match;

  while ((match = contactRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        contacts.push(...parsed);
      }
    } catch {
      // Skip invalid JSON
    }
  }

  // Remove contact blocks from text
  textContent = textContent.replace(contactRegex, "").trim();

  return { textContent, contacts };
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialQuery = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setIsStreaming(true);

      try {
        const allMessages = [
          ...messages.filter((m) => m.id !== "welcome"),
          userMessage,
        ].map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || "Er ging iets mis. Probeer het opnieuw."
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Geen stream beschikbaar.");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulated += parsed.content;
                  const { textContent, contacts } =
                    parseContactsFromContent(accumulated);

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            content: accumulated,
                            contacts:
                              contacts.length > 0 ? contacts : m.contacts,
                          }
                        : m
                    )
                  );

                  // Trigger re-parse only to keep contacts synced
                  void textContent;
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        // Final parse for contacts
        const { contacts } = parseContactsFromContent(accumulated);
        if (contacts.length > 0) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, contacts } : m
            )
          );
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Er ging iets mis. Probeer het opnieuw.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: errorMsg } : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, scrollToBottom]
  );

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && !hasInitialQuery.current) {
      hasInitialQuery.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] animate-fade-in ${
                  message.role === "user"
                    ? "rounded-2xl rounded-br-md bg-foreground px-4 py-3 text-sm text-white"
                    : "space-y-3"
                }`}
              >
                {message.role === "assistant" ? (
                  <>
                    {/* Assistant icon + text */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gold-dark"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        {message.content ? (
                          <div
                            className="prose-chat text-sm leading-relaxed text-foreground/90"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(
                                parseContactsFromContent(message.content)
                                  .textContent
                              ),
                            }}
                          />
                        ) : isStreaming &&
                          message.id ===
                            messages[messages.length - 1]?.id ? (
                          <div className="flex items-center gap-1.5 py-2">
                            <div className="typing-dot h-2 w-2 rounded-full bg-gold/60" />
                            <div
                              className="typing-dot h-2 w-2 rounded-full bg-gold/60"
                              style={{ animationDelay: "0.15s" }}
                            />
                            <div
                              className="typing-dot h-2 w-2 rounded-full bg-gold/60"
                              style={{ animationDelay: "0.3s" }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Contact cards */}
                    {message.contacts && message.contacts.length > 0 && (
                      <div className="ml-10 grid gap-2 sm:grid-cols-2">
                        {message.contacts.map((contact) => (
                          <ChatContactCard
                            key={contact.id}
                            contact={contact}
                            onSelect={setSelectedContactId}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-white/95 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-3 px-4 py-3 sm:px-6"
        >
          <div className="relative flex min-h-[44px] flex-1 items-center overflow-hidden rounded-2xl border border-border bg-white shadow-[0_2px_8px_hsla(36,30%,50%,0.04)] transition-shadow focus-within:shadow-[0_4px_16px_hsla(36,30%,50%,0.1)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Beschrijf wie u zoekt..."
              rows={1}
              className="max-h-[120px] flex-1 resize-none bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none"
              disabled={isStreaming}
              data-testid="input-chat"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-foreground text-white transition-all hover:bg-foreground/85 disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="button-send"
            aria-label="Verstuur bericht"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

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
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
