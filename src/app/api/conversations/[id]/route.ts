import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = getSupabase();

    const { data: conversation, error: convError } = await sb
      .from("conversations")
      .select("id, title, created_at")
      .eq("id", id)
      .single();

    if (convError) {
      if (
        convError.code === "42P01" ||
        convError.message?.includes("does not exist")
      ) {
        return Response.json(
          { error: "Tabel bestaat nog niet.", tableExists: false },
          { status: 503 }
        );
      }
      if (convError.code === "PGRST116") {
        return Response.json(
          { error: "Gesprek niet gevonden." },
          { status: 404 }
        );
      }
      throw convError;
    }

    const { data: messages, error: msgError } = await sb
      .from("messages")
      .select("id, role, content, contacts, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

    return Response.json({
      conversation,
      messages: messages || [],
    });
  } catch (err) {
    console.error("GET /api/conversations/[id] error:", err);
    return Response.json(
      { error: "Kon gesprek niet ophalen." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = getSupabase();

    // Delete messages first (cascade)
    await sb.from("messages").delete().eq("conversation_id", id);

    const { error } = await sb
      .from("conversations")
      .delete()
      .eq("id", id);

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

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/conversations/[id] error:", err);
    return Response.json(
      { error: "Kon gesprek niet verwijderen." },
      { status: 500 }
    );
  }
}
