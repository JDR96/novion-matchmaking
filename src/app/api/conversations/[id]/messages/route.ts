import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = getSupabase();
    const body = await request.json();

    const { role, content, contacts } = body as {
      role: "user" | "assistant";
      content: string;
      contacts?: unknown;
    };

    if (!role || !content) {
      return Response.json(
        { error: "role en content zijn verplicht." },
        { status: 400 }
      );
    }

    // Insert the message
    const { data: message, error: msgError } = await sb
      .from("messages")
      .insert({
        conversation_id: id,
        role,
        content,
        contacts: contacts || null,
      })
      .select("id, role, content, contacts, created_at")
      .single();

    if (msgError) {
      if (
        msgError.code === "42P01" ||
        msgError.message?.includes("does not exist")
      ) {
        return Response.json(
          { error: "Tabel bestaat nog niet.", tableExists: false },
          { status: 503 }
        );
      }
      throw msgError;
    }

    // Update conversation's updated_at
    await sb
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    // Auto-generate title if this is the first user message and title is default
    if (role === "user") {
      const { data: conv } = await sb
        .from("conversations")
        .select("title")
        .eq("id", id)
        .single();

      if (conv && conv.title === "Nieuw gesprek") {
        const autoTitle =
          content.length > 50 ? content.slice(0, 50) + "…" : content;
        await sb
          .from("conversations")
          .update({ title: autoTitle })
          .eq("id", id);
      }
    }

    return Response.json({ message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/conversations/[id]/messages error:", err);
    return Response.json(
      { error: "Kon bericht niet opslaan." },
      { status: 500 }
    );
  }
}
