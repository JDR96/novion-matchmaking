import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Extract a clean first name and last name from a full name string.
 * Strips parenthetical content, initials, prefixes, and suffixes.
 * Examples:
 *   "(Kees) C. P. F. van Eijk" → { first: "Kees", last: "van Eijk" }
 *   "drs. J.C. (Jan Kees) van Vliet" → { first: "Jan Kees", last: "van Vliet" }
 *   "Jelle Tas" → { first: "Jelle", last: "Tas" }
 */
function extractCleanName(fullName: string): {
  first: string;
  last: string;
} {
  let name = fullName.trim();

  // Extract name from parentheses if present (often the actual call name)
  const parenMatch = name.match(/\(([^)]+)\)/);
  let callName = parenMatch ? parenMatch[1].trim() : "";

  // Remove all parenthetical content from the main name
  name = name.replace(/\([^)]*\)/g, "").trim();

  // Remove common prefixes
  name = name
    .replace(/^(prof\.|dr\.|drs\.|ir\.|mr\.|ing\.|bc\.|msc\.?|bsc\.?)\s*/gi, "")
    .trim();

  // Split into parts
  const parts = name.split(/\s+/).filter((p) => p.length > 0);

  // Remove parts that are just initials (single letters or letters with dots)
  const realParts = parts.filter(
    (p) => !p.match(/^[A-Z]\.?$/i) && !p.match(/^[A-Z]\.[A-Z]\.?$/i)
  );

  // Dutch name prefixes that belong to the last name
  const prefixes = new Set([
    "van",
    "de",
    "den",
    "der",
    "het",
    "ter",
    "ten",
    "te",
    "op",
    "in",
    "'t",
  ]);

  let firstName = "";
  let lastName = "";

  if (realParts.length >= 2) {
    // Find where the last name starts (first prefix or last word)
    let lastNameStart = realParts.length - 1;
    for (let i = 1; i < realParts.length; i++) {
      if (prefixes.has(realParts[i].toLowerCase())) {
        lastNameStart = i;
        break;
      }
    }
    firstName = realParts.slice(0, lastNameStart).join(" ");
    lastName = realParts.slice(lastNameStart).join(" ");
  } else if (realParts.length === 1) {
    firstName = realParts[0];
    lastName = "";
  }

  // If we found a call name in parentheses, use it as first name
  if (callName) {
    // If callName has multiple words, use them all as first name
    firstName = callName;
  }

  return { first: firstName, last: lastName };
}

/**
 * Search for a LinkedIn profile using Google search.
 */
async function searchLinkedIn(
  fullName: string,
  organization: string | null
): Promise<{ url: string | null; searched: boolean }> {
  try {
    const { first, last } = extractCleanName(fullName);

    if (!first && !last) {
      return { url: null, searched: true };
    }

    const namePart = [first, last].filter(Boolean).join(" ");

    // Build Google search query
    const searchTerms = organization
      ? `${namePart} ${organization} linkedin`
      : `${namePart} linkedin`;

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}&num=5`;

    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // Fallback: construct a LinkedIn search URL
      return {
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(namePart)}`,
        searched: true,
      };
    }

    const html = await response.text();

    // Extract LinkedIn profile URLs from Google results
    const linkedinPattern =
      /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/g;
    const matches = html.match(linkedinPattern);

    if (matches && matches.length > 0) {
      // Deduplicate and return the first unique one
      const uniqueUrls = [...new Set(matches)];
      return { url: uniqueUrls[0], searched: true };
    }

    // No profile found, return a LinkedIn search link instead
    return {
      url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(namePart)}`,
      searched: true,
    };
  } catch {
    // On timeout or error, return a search link
    const { first, last } = extractCleanName(fullName);
    const namePart = [first, last].filter(Boolean).join(" ");
    if (namePart) {
      return {
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(namePart)}`,
        searched: true,
      };
    }
    return { url: null, searched: true };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: "Ongeldig contact-ID." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Contact niet gevonden." },
        { status: 404 }
      );
    }

    const c = data as Record<string, unknown>;

    // If no LinkedIn URL exists, try to find one via Google
    let linkedinUrl = c.linkedin_url ? String(c.linkedin_url) : null;
    let linkedinSearched = false;

    if (!linkedinUrl) {
      const name = String(c.volledige_naam || "");
      const org = c.organisatie ? String(c.organisatie) : null;
      if (name && name !== "Onbekend" && name.length > 2) {
        const result = await searchLinkedIn(name, org);
        linkedinUrl = result.url;
        linkedinSearched = result.searched;
      }
    }

    // Build location parts
    const addressParts = [c.straat, c.postcode, c.stad, c.land].filter(
      Boolean
    );

    const contact = {
      id: c.id,
      full_name: c.volledige_naam || "Onbekend",
      first_name: c.voornaam || null,
      last_name: c.achternaam || null,
      organization: c.organisatie || null,
      job_title: c.functie || null,
      email_1: c.email_1 || null,
      email_2: c.email_2 || null,
      phone_1: c.telefoon_1 || null,
      phone_2: c.telefoon_2 || null,
      address: addressParts.length > 0 ? addressParts.join(", ") : null,
      city: c.stad || null,
      country: c.land || null,
      sector: c.sector || null,
      tags: c.tags || null,
      linkedin_url: linkedinUrl,
      linkedin_searched: linkedinSearched,
      source: c.bron || null,
      quality_score: c.kwaliteitsscore ?? null,
      function_level: c.functieniveau || null,
      expertise: c.expertise || null,
      suriname_score: c.suriname_score ?? null,
      bio: c.bio || null,
      notes: c.notities || null,
    };

    return NextResponse.json({ contact });
  } catch (err) {
    console.error("Contact detail error:", err);
    return NextResponse.json(
      { error: "Er ging iets mis." },
      { status: 500 }
    );
  }
}
