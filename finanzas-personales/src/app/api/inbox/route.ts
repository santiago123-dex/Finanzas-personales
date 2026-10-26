import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashBankToken } from "@/lib/bank-token";
import { parseBankText } from "@/lib/parse-bank-text";

// Lo llama el Atajo de iOS con el texto de la notificación, correo o SMS.
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Falta el token" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: tokenRow } = await admin
    .from("bank_tokens")
    .select("user_id")
    .eq("token_hash", hashBankToken(token))
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  let text = "";
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    text = typeof body?.text === "string" ? body.text : "";
  } else {
    text = await request.text();
  }
  text = text.slice(0, 2000);

  const parsed = parseBankText(text);
  if (!parsed) {
    return NextResponse.json(
      { error: "No encontré un monto en el texto" },
      { status: 422 }
    );
  }

  // Evita duplicados si el Atajo se dispara dos veces seguidas.
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: dup } = await admin
    .from("pending_transactions")
    .select("id")
    .eq("user_id", tokenRow.user_id)
    .eq("raw_text", text)
    .gte("created_at", since)
    .maybeSingle();

  if (!dup) {
    const { error } = await admin.from("pending_transactions").insert({
      user_id: tokenRow.user_id,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      raw_text: text,
    });
    if (error) {
      return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, ...parsed });
}
