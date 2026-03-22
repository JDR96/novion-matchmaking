import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  try {
    const sb = getSupabase();

    const { data: conversations, error } = await sb
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      // Table doesn't exist yet — graceful degradation
      if (
        error.code === "42P01" ||
        error.message?.includes("does not exist")
      ) {
        return Response.json(
          { conversations: [], tableExists: false },
          { status: 200 }
        );
      }
      throw error;
    }

    // Fetch first user message per conversation for preview
    const ids = (conversations || []).map((c) => c.id);
    let previewMap: Record<string, string> = {};

    if (ids.length > 0) {
      const { data: previews } = await sb
        .from("messages")
        .select("conversation_id, content")
        .in("conversation_id", ids)
        .eq("role", "user")
        .order("created_at", { ascending: true });

      if (previews) {
        for (const p of previews) {
          if (!previewMap[p.conversation_id]) {
            previewMap[p.conversation_id] =
              p.content.length > 80
                ? p.content.slice(0, 80) + "…"
                : p.content;
          }
        }
      }
    }

    const result = (conversations || []).map((c) => ({
      id: c.id,
      title: c.title,
      updated_at: c.updated_at,
      preview: previewMap[c.id] || null,
    }));

    return Response.json({ conversations: result, tableExists: true });
  } catch (err) {
    console.error("GET /api/conversations error:", err);
    return Response.json(
      { error: "Kon gesprekken niet ophalen." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sb = getSupabase();
    const body = await request.json();
    const title = body.title || "Nieuw gesprek";

    const { data, error } = await sb
      .from("conversations")
      .insert({ title })
      .select("id, title")
      .single();

    if (error) {
      if (
        error.code === "42P01" ||
        error.message?.includes("does not exist")
      ) {
        return Response.json(
          { error: "Tabel bestaat nog niet.", tableExists: false },
          { status: 503 }
        );
      }
      throw error;
    }

    return Response.json({ conversation: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/conversations error:", err);
    return Response.json(
      { error: "Kon gesprek niet aanmaken." },
      { status: 500 }
    );
  }
}
