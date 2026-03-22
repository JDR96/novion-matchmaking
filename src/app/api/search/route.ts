import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Voer een zoekopdracht in." },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Call the match_contacts RPC function for vector similarity search
    // The RPC returns: id, volledige_naam, organisatie, functie, sector, bio, similarity
    const { data, error } = await supabase.rpc("match_contacts", {
      query_embedding: queryEmbedding,
      match_threshold: 0.0,
      match_count: 10,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { error: "Er ging iets mis bij het zoeken. Probeer het opnieuw." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        results: [],
        query: query.trim(),
        count: 0,
      });
    }

    // Fetch full contact data (including expertise and tags) for matched IDs
    const matchedIds = data.map((d: Record<string, unknown>) => d.id);
    const { data: fullContacts } = await supabase
      .from("contacts")
      .select(
        "id, volledige_naam, organisatie, functie, sector, expertise, tags, bio, functieniveau, suriname_score"
      )
      .in("id", matchedIds);

    // Create a lookup map for full contact data
    const contactMap = new Map<number, Record<string, unknown>>();
    if (fullContacts) {
      for (const c of fullContacts) {
        contactMap.set(c.id as number, c);
      }
    }

    // Build a similarity lookup from the RPC results
    const similarityMap = new Map<number, number>();
    for (const d of data) {
      similarityMap.set(
        d.id as number,
        typeof d.similarity === "number" ? d.similarity : parseFloat(String(d.similarity)) || 0
      );
    }

    // Transform results, using full contact data merged with similarity scores
    const results = matchedIds.map((id: number) => {
      const full = contactMap.get(id) || {};
      const rpcRow = data.find((d: Record<string, unknown>) => d.id === id) || {};
      const similarity = similarityMap.get(id) || 0;

      // Use full contact data, fall back to RPC data
      const name = (full as Record<string, unknown>).volledige_naam || (rpcRow as Record<string, unknown>).volledige_naam || "Onbekend";
      const org = (full as Record<string, unknown>).organisatie || (rpcRow as Record<string, unknown>).organisatie || "";
      const title = (full as Record<string, unknown>).functie || (rpcRow as Record<string, unknown>).functie || "";
      const sector = (full as Record<string, unknown>).sector || (rpcRow as Record<string, unknown>).sector || "";
      const bio = (full as Record<string, unknown>).bio || (rpcRow as Record<string, unknown>).bio || "";
      const expertise = (full as Record<string, unknown>).expertise || "";
      const tags = (full as Record<string, unknown>).tags || "";
      const functieniveau = (full as Record<string, unknown>).functieniveau || "";

      // Build labels from expertise, tags, sector, and functieniveau
      const labels: string[] = [];

      // Add sector as first label
      if (sector && sector !== "Other") {
        labels.push(sector as string);
      }

      // Add expertise
      if (expertise) {
        const expertiseStr = String(expertise);
        if (expertiseStr && expertiseStr !== "Other") {
          // Split if comma-separated
          const parts = expertiseStr.split(",").map((t: string) => t.trim()).filter(Boolean);
          for (const part of parts) {
            if (!labels.includes(part)) labels.push(part);
          }
        }
      }

      // Add functieniveau
      if (functieniveau && functieniveau !== "Other") {
        if (!labels.includes(functieniveau as string)) {
          labels.push(functieniveau as string);
        }
      }

      // Parse country from tags (format: "country:belgium,region:europe,sector:finance")
      if (tags) {
        const tagStr = String(tags);
        const tagParts = tagStr.split(",").map((t: string) => t.trim());
        for (const tag of tagParts) {
          if (tag.startsWith("country:")) {
            const country = tag.replace("country:", "").trim();
            if (country && !labels.includes(country)) {
              labels.push(country.charAt(0).toUpperCase() + country.slice(1));
            }
          }
        }
      }

      // Build motivation sentence from bio or constructed
      let motivation: string;
      if (bio && String(bio).length > 10) {
        motivation = String(bio);
      } else {
        const parts: string[] = [];
        if (title) parts.push(`de functie ${title}`);
        if (org) parts.push(`werkzaam bij ${org}`);
        if (sector) parts.push(`actief in de ${sector}-sector`);
        motivation =
          parts.length > 0
            ? `${name} is relevant: ${parts.join(", ")}.`
            : `${name} komt overeen met uw zoekcriteria.`;
      }

      return {
        id,
        full_name: name as string,
        organization: (org as string) || null,
        job_title: (title as string) || null,
        sector: (sector as string) || null,
        match_score: Math.round(similarity * 100) / 100,
        labels: labels.slice(0, 5),
        motivation,
      };
    });

    // Apply optional client-side filters
    let filtered = results;
    if (filters?.sector) {
      filtered = filtered.filter(
        (r: { sector: string | null }) =>
          r.sector?.toLowerCase() === filters.sector.toLowerCase()
      );
    }

    return NextResponse.json({
      results: filtered,
      query: query.trim(),
      count: filtered.length,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      {
        error:
          "Er ging iets mis. Controleer de configuratie en probeer het opnieuw.",
      },
      { status: 500 }
    );
  }
}
