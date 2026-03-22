import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
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

    // Transform results
    const results = (data || []).map((contact: Record<string, unknown>) => {
      // Parse labels from expertise_tags or other tag fields
      const labels: string[] = [];
      if (contact.expertise_tags) {
        if (typeof contact.expertise_tags === "string") {
          try {
            const parsed = JSON.parse(contact.expertise_tags as string);
            if (Array.isArray(parsed)) labels.push(...parsed);
          } catch {
            labels.push(
              ...(contact.expertise_tags as string)
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            );
          }
        } else if (Array.isArray(contact.expertise_tags)) {
          labels.push(...(contact.expertise_tags as string[]));
        }
      }
      if (contact.sector && !labels.includes(contact.sector as string)) {
        labels.unshift(contact.sector as string);
      }

      // Generate motivation sentence
      const name = contact.full_name || "Onbekend";
      const org = contact.organization || "";
      const title = contact.job_title || "";
      const sector = contact.sector || "";

      let motivation = `${name} is relevant op basis van`;
      const parts: string[] = [];
      if (title) parts.push(`de functie ${title}`);
      if (org) parts.push(`werkzaam bij ${org}`);
      if (sector) parts.push(`actief in de ${sector}-sector`);
      motivation =
        parts.length > 0
          ? `${name} is relevant: ${parts.join(", ")}.`
          : `${name} komt overeen met uw zoekcriteria.`;

      return {
        id: contact.id,
        full_name: contact.full_name || "Onbekend",
        organization: contact.organization || null,
        job_title: contact.job_title || null,
        sector: contact.sector || null,
        match_score: Math.round((contact.similarity as number || 0) * 100) / 100,
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
      { error: "Er ging iets mis. Controleer de configuratie en probeer het opnieuw." },
      { status: 500 }
    );
  }
}
