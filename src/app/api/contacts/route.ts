import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(10, parseInt(searchParams.get("limit") || "50"))
    );
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const sort = searchParams.get("sort") || "volledige_naam";
    const order = searchParams.get("order") === "desc" ? false : true;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("contacts")
      .select(
        "id, volledige_naam, organisatie, functie, sector, expertise, email_1, telefoon_1, linkedin_url, stad, land, functieniveau, suriname_score, bron",
        { count: "exact" }
      );

    // Text search: split into words, each word must match at least one field
    // This way "Kees van Eijk" finds "(Kees) C. P. F. van Eijk"
    if (search) {
      const words = search
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);

      for (const word of words) {
        query = query.or(
          `volledige_naam.ilike.%${word}%,organisatie.ilike.%${word}%,functie.ilike.%${word}%,sector.ilike.%${word}%,expertise.ilike.%${word}%`
        );
      }
    }

    // Sector filter
    if (sector) {
      query = query.ilike("sector", `%${sector}%`);
    }

    // Sorting
    const validSortFields = [
      "volledige_naam",
      "organisatie",
      "functie",
      "sector",
      "suriname_score",
      "kwaliteitsscore",
    ];
    const sortField = validSortFields.includes(sort)
      ? sort
      : "volledige_naam";
    query = query.order(sortField, { ascending: order, nullsFirst: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase contacts query error:", error);
      return NextResponse.json(
        { error: "Er ging iets mis bij het ophalen van contacten." },
        { status: 500 }
      );
    }

    // Transform data
    const contacts = (data || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      full_name: c.volledige_naam || "Onbekend",
      organization: c.organisatie || null,
      job_title: c.functie || null,
      sector: c.sector || null,
      expertise: c.expertise || null,
      email: c.email_1 || null,
      phone: c.telefoon_1 || null,
      linkedin_url: c.linkedin_url || null,
      location: [c.stad, c.land].filter(Boolean).join(", ") || null,
      function_level: c.functieniveau || null,
      suriname_score: c.suriname_score ?? null,
      source: c.bron || null,
    }));

    return NextResponse.json({
      contacts,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error("Contacts API error:", err);
    return NextResponse.json(
      { error: "Er ging iets mis." },
      { status: 500 }
    );
  }
}
