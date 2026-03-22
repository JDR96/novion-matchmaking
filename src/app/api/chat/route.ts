import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

const SYSTEM_PROMPT = `Je bent de matchmaking-assistent van Novion Capital. Je helpt gebruikers de juiste contacten te vinden uit een database van 17.500+ professionals.

Gedragsregels:
- Communiceer altijd in het Nederlands
- Als een zoekvraag vaag is, stel dan eerst 1-2 verhelderende vragen voordat je zoekt. Vraag bijvoorbeeld naar: sector, land/regio, type functie, specifieke expertise. Stel niet te veel vragen, wees efficiënt.
- Als je genoeg context hebt, gebruik dan search_contacts om te zoeken
- Na het vinden van contacten, gebruik search_web om actuele informatie over hun bedrijven/organisaties op te zoeken (nieuws, jaarverslagen, projecten)
- Wees professioneel maar toegankelijk
- Als er geen resultaten zijn, stel dan alternatieve zoektermen voor

Belangrijk over contactresultaten:
- De contactkaarten worden AUTOMATISCH als klikbare kaarten weergegeven in de interface. Je hoeft ze NIET zelf als JSON of in een speciaal formaat te presenteren.
- Geef NA de contactkaarten een uitgebreide toelichting per gevonden contact:
  1. Waarom deze persoon relevant is voor de zoekvraag
  2. Wat hun organisatie doet (gebruik info uit search_web)
  3. Recente ontwikkelingen of projecten van de organisatie die relevant zijn
  4. Hoe deze persoon concreet kan bijdragen aan het doel van de gebruiker
- Nummer de contacten (1, 2, 3, etc.) en gebruik hun naam in bold (**Naam**)
- Schrijf minstens 2-3 zinnen toelichting per contact
- Gebruik GEEN <!--CONTACTS_START--> of andere markers in je tekst, dat regelt het systeem`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_contacts",
      description:
        "Zoek in de contactendatabase via vector search. Gebruik dit wanneer de gebruiker naar specifieke mensen, rollen, sectoren of expertise zoekt.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "De zoekvraag in natuurlijke taal, bijv. 'directeur energiesector Suriname'",
          },
          limit: {
            type: "number",
            description: "Maximaal aantal resultaten (standaard 5)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_web",
      description:
        "Zoek op het web naar actuele informatie over een bedrijf of organisatie. Gebruik dit om context toe te voegen over de organisaties van gevonden contacten.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "De zoekvraag, bijv. 'Staatsolie Suriname recent nieuws'",
          },
        },
        required: ["query"],
      },
    },
  },
];

function buildLocation(
  stad: string | null,
  land: string | null
): string | null {
  const parts = [stad, land].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

async function executeSearchContacts(
  query: string,
  limit: number = 5
): Promise<string> {
  try {
    const oai = getOpenAI();
    const sb = getSupabase();

    const embeddingResponse = await oai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    const matchCount = Math.min(20, Math.max(1, limit));

    const { data, error } = await sb.rpc("match_contacts", {
      query_embedding: queryEmbedding,
      match_threshold: 0.0,
      match_count: matchCount,
    });

    if (error) {
      return JSON.stringify({ error: "Zoekfout in database", results: [] });
    }

    if (!data || data.length === 0) {
      return JSON.stringify({ results: [], message: "Geen contacten gevonden" });
    }

    const matchedIds = data.map((d: Record<string, unknown>) => d.id);
    const { data: fullContacts } = await sb
      .from("contacts")
      .select(
        "id, volledige_naam, organisatie, functie, sector, expertise, tags, bio, functieniveau, suriname_score, email_1, email_2, telefoon_1, telefoon_2, linkedin_url, stad, land, bron"
      )
      .in("id", matchedIds);

    const contactMap = new Map<number, Record<string, unknown>>();
    if (fullContacts) {
      for (const c of fullContacts) {
        contactMap.set(c.id as number, c);
      }
    }

    const similarityMap = new Map<number, number>();
    for (const d of data) {
      similarityMap.set(
        d.id as number,
        typeof d.similarity === "number"
          ? d.similarity
          : parseFloat(String(d.similarity)) || 0
      );
    }

    const results = matchedIds.map((id: number) => {
      const full = (contactMap.get(id) || {}) as Record<string, unknown>;
      const similarity = similarityMap.get(id) || 0;

      const name = String(full.volledige_naam || "Onbekend");
      const org = String(full.organisatie || "");
      const title = String(full.functie || "");
      const sector = String(full.sector || "");
      const expertise = String(full.expertise || "");
      const functieniveau = String(full.functieniveau || "");
      const surinameScore =
        full.suriname_score !== null && full.suriname_score !== undefined
          ? Number(full.suriname_score)
          : null;

      const email = full.email_1 ? String(full.email_1) : null;
      const phone = full.telefoon_1 ? String(full.telefoon_1) : null;
      const linkedinUrl = full.linkedin_url ? String(full.linkedin_url) : null;
      const location = buildLocation(
        full.stad ? String(full.stad) : null,
        full.land ? String(full.land) : null
      );
      const bio = String(full.bio || "");
      const source = full.bron ? String(full.bron) : null;

      const labels: string[] = [];
      if (sector && sector !== "Other" && sector !== "null") {
        sector
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s && s !== "Other" && !labels.includes(s))
          .forEach((s: string) => labels.push(s));
      }
      if (expertise && expertise !== "Other" && expertise !== "null") {
        expertise
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t && t !== "Other" && !labels.includes(t))
          .forEach((t: string) => labels.push(t));
      }
      if (functieniveau && functieniveau !== "Other" && functieniveau !== "null") {
        if (!labels.includes(functieniveau)) labels.push(functieniveau);
      }
      if (surinameScore !== null && surinameScore >= 0.6) {
        if (!labels.includes("Suriname")) labels.unshift("Suriname");
      }

      return {
        id,
        full_name: name,
        organization: org || null,
        job_title: title || null,
        sector: sector || null,
        match_score: Math.round(similarity * 100) / 100,
        labels: labels.slice(0, 6),
        motivation: bio || `${name}: ${title ? title + " bij " + org : org}`,
        email,
        phone,
        linkedin_url: linkedinUrl,
        location,
        function_level: functieniveau || null,
        suriname_score: surinameScore,
        source,
      };
    });

    return JSON.stringify({ results });
  } catch (err) {
    console.error("search_contacts error:", err);
    return JSON.stringify({ error: "Zoekfout", results: [] });
  }
}

async function executeSearchWeb(query: string): Promise<string> {
  try {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`;

    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "nl-NL,nl;q=0.9,en-US;q=0.8",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return JSON.stringify({
        summary: `Geen webresultaten gevonden voor "${query}".`,
      });
    }

    const html = await response.text();

    // Extract text snippets from Google results
    const snippets: string[] = [];

    // Match common Google snippet patterns
    const snippetPatterns = [
      /<span class="[^"]*">([^<]{40,300})<\/span>/g,
      /<div class="[^"]*" data-sncf="[^"]*">([^<]{40,300})<\/div>/g,
      /class="VwiC3b[^"]*"[^>]*><span[^>]*>([^<]{30,300})<\/span>/g,
    ];

    for (const pattern of snippetPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && snippets.length < 5) {
        const text = match[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        if (text.length > 30 && !snippets.includes(text)) {
          snippets.push(text);
        }
      }
    }

    if (snippets.length === 0) {
      return JSON.stringify({
        summary: `Zoekopdracht uitgevoerd voor "${query}" maar geen duidelijke resultaten gevonden.`,
      });
    }

    return JSON.stringify({
      query,
      snippets: snippets.slice(0, 3),
      summary: snippets.slice(0, 3).join(" | "),
    });
  } catch {
    return JSON.stringify({
      summary: `Web zoeken voor "${query}" kon niet worden uitgevoerd.`,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Geen berichten meegegeven." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const oai = getOpenAI();

    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Tool call loop — collect contact results, then stream final response
    let toolCallLoop = true;
    const maxToolCalls = 6;
    let toolCallCount = 0;
    let collectedContacts: unknown[] = []; // Collect contacts from tool calls

    while (toolCallLoop && toolCallCount < maxToolCalls) {
      const response = await oai.chat.completions.create({
        model: "gpt-4o",
        messages: openaiMessages,
        tools,
        tool_choice: "auto",
        temperature: 0.7,
      });

      const choice = response.choices[0];
      const message = choice.message;

      if (
        choice.finish_reason === "tool_calls" &&
        message.tool_calls &&
        message.tool_calls.length > 0
      ) {
        openaiMessages.push(message);

        for (const toolCall of message.tool_calls) {
          if (toolCall.type !== "function") continue;

          const fn = toolCall.function;
          const args = JSON.parse(fn.arguments);
          let result: string;

          if (fn.name === "search_contacts") {
            result = await executeSearchContacts(
              args.query,
              args.limit || 5
            );
            // Extract contacts from result for frontend rendering
            try {
              const parsed = JSON.parse(result);
              if (parsed.results && parsed.results.length > 0) {
                collectedContacts = [...collectedContacts, ...parsed.results];
              }
            } catch { /* ignore parse errors */ }
          } else if (fn.name === "search_web") {
            result = await executeSearchWeb(args.query);
          } else {
            result = JSON.stringify({ error: "Onbekende tool" });
          }

          openaiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        toolCallCount++;
      } else {
        toolCallLoop = false;
      }
    }

    // Stream the final response, injecting contact cards at the start
    const stream = await oai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Inject collected contacts as a card block BEFORE the text response
          if (collectedContacts.length > 0) {
            const contactsBlock = `<!--CONTACTS_START-->${JSON.stringify(collectedContacts)}<!--CONTACTS_END-->\n\n`;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: contactsBlock })}\n\n`)
            );
          }

          // Stream the model's text response
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({
        error:
          "Er ging iets mis. Controleer de configuratie en probeer het opnieuw.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
