import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

function buildLocation(stad: string | null, land: string | null): string | null {
  const parts = [stad, land].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildMotivation(
  name: string,
  title: string,
  org: string,
  sector: string,
  expertise: string,
  bio: string,
  surinameScore: number | null
): string {
  if (bio && bio.length > 30 && !bio.startsWith(`${name} is `)) {
    return bio;
  }

  const parts: string[] = [];

  if (title && org) {
    parts.push(`${title} bij ${org}`);
  } else if (title) {
    parts.push(title);
  } else if (org) {
    parts.push(`werkzaam bij ${org}`);
  }

  if (sector && sector !== "Other") {
    parts.push(`actief in de ${sector}-sector`);
  }

  if (expertise && expertise !== "Other" && expertise !== sector) {
    const expertiseParts = expertise
      .split(",")
      .map((e: string) => e.trim())
      .filter((e: string) => e && e !== "Other" && e !== sector);
    if (expertiseParts.length > 0) {
      parts.push(`expertise in ${expertiseParts.slice(0, 2).join(" en ")}`);
    }
  }

  if (surinameScore !== null && surinameScore >= 0.6) {
    parts.push("directe Suriname-relevantie");
  } else if (surinameScore !== null && surinameScore >= 0.4) {
    parts.push("potentieel Suriname-relevant");
  }

  if (parts.length === 0) {
    return `${name} komt overeen met uw zoekcriteria.`;
  }

  return `${name}: ${parts.join(". ")}.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, limit: requestedLimit } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Voer een zoekopdracht in." },
        { status: 400 }
      );
    }

    // Allow configurable result count (10, 25, or 50)
    const matchCount = Math.min(
      50,
      Math.max(10, parseInt(requestedLimit) || 10)
    );

    const embeddingResponse = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const { data, error } = await getSupabase().rpc("match_contacts", {
      query_embedding: queryEmbedding,
      match_threshold: 0.0,
      match_count: matchCount,
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

    const matchedIds = data.map((d: Record<string, unknown>) => d.id);
    const { data: fullContacts } = await getSupabase()
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
      const rpcRow = (data.find((d: Record<string, unknown>) => d.id === id) ||
        {}) as Record<string, unknown>;
      const similarity = similarityMap.get(id) || 0;

      const name = String(full.volledige_naam || rpcRow.volledige_naam || "Onbekend");
      const org = String(full.organisatie || rpcRow.organisatie || "");
      const title = String(full.functie || rpcRow.functie || "");
      const sector = String(full.sector || rpcRow.sector || "");
      const bio = String(full.bio || rpcRow.bio || "");
      const expertise = String(full.expertise || "");
      const functieniveau = String(full.functieniveau || "");
      const surinameScore =
        full.suriname_score !== null && full.suriname_score !== undefined
          ? Number(full.suriname_score)
          : null;
      const tags = String(full.tags || "");

      const email = full.email_1 ? String(full.email_1) : null;
      const phone = full.telefoon_1 ? String(full.telefoon_1) : null;
      const linkedinUrl = full.linkedin_url ? String(full.linkedin_url) : null;
      const location = buildLocation(
        full.stad ? String(full.stad) : null,
        full.land ? String(full.land) : null
      );
      const source = full.bron ? String(full.bron) : null;

      // Build labels
      const labels: string[] = [];
      if (sector && sector !== "Other" && sector !== "null") {
        const sectorParts = sector.split(",").map((s: string) => s.trim());
        for (const sp of sectorParts) {
          if (sp && sp !== "Other" && !labels.includes(sp)) labels.push(sp);
        }
      }
      if (expertise && expertise !== "Other" && expertise !== "null") {
        const expParts = expertise.split(",").map((t: string) => t.trim());
        for (const part of expParts) {
          if (part && part !== "Other" && !labels.includes(part)) labels.push(part);
        }
      }
      if (functieniveau && functieniveau !== "Other" && functieniveau !== "null") {
        if (!labels.includes(functieniveau)) labels.push(functieniveau);
      }
      if (tags && tags !== "null") {
        const tagParts = tags.split(",").map((t: string) => t.trim());
        for (const tag of tagParts) {
          if (tag.startsWith("country:")) {
            const country = tag.replace("country:", "").trim();
            if (country && !labels.includes(country)) {
              labels.push(country.charAt(0).toUpperCase() + country.slice(1));
            }
          }
        }
      }
      if (surinameScore !== null && surinameScore >= 0.6) {
        if (!labels.includes("Suriname")) labels.unshift("Suriname");
      }

      const motivation = buildMotivation(name, title, org, sector, expertise, bio, surinameScore);

      return {
        id,
        full_name: name,
        organization: org || null,
        job_title: title || null,
        sector: sector || null,
        match_score: Math.round(similarity * 100) / 100,
        labels: labels.slice(0, 6),
        motivation,
        email,
        phone,
        linkedin_url: linkedinUrl,
        location,
        function_level: functieniveau || null,
        suriname_score: surinameScore,
        source,
      };
    });

    let filtered = results;
    if (filters?.sector) {
      filtered = filtered.filter(
        (r: { sector: string | null }) =>
          r.sector?.toLowerCase().includes(filters.sector.toLowerCase())
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
