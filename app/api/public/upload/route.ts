import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { containsSensitiveWord } from "@/lib/sensitive-words";
import { TOP_N } from "@/types";

interface UploadBody {
  fingerprint?: string;
  username?: string;
  tmdbIds?: number[];
  turnstileToken?: string;
}

export async function POST(request: NextRequest) {
  let body: UploadBody;
  try {
    body = (await request.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fingerprint, username, tmdbIds, turnstileToken } = body;

  if (!turnstileToken) {
    return NextResponse.json({ error: "Missing captcha token" }, { status: 400 });
  }

  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Captcha verification failed" }, { status: 403 });
  }

  if (!fingerprint || typeof fingerprint !== "string") {
    return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
  }

  const trimmedName = (username || "").trim();
  if (!trimmedName || trimmedName.length > 20) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  if (await containsSensitiveWord(trimmedName)) {
    return NextResponse.json(
      { error: "SENSITIVE_USERNAME" },
      { status: 400 }
    );
  }

  if (!Array.isArray(tmdbIds) || tmdbIds.length !== TOP_N) {
    return NextResponse.json({ error: `tmdbIds must have ${TOP_N} entries` }, { status: 400 });
  }

  const validIds = tmdbIds.every((id) => typeof id === "number" && !isNaN(id));
  if (!validIds) {
    return NextResponse.json({ error: "Invalid tmdbIds" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: existing } = await supabase
    .from("public_lists")
    .select("id")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  if (existing) {
    await supabase.from("public_lists").delete().eq("fingerprint", fingerprint);
  }

  const { data, error } = await supabase
    .from("public_lists")
    .insert({
      fingerprint,
      username: trimmedName,
      tmdb_ids: tmdbIds,
      like_count: 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(request: NextRequest) {
  let body: { fingerprint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fingerprint } = body;
  if (!fingerprint || typeof fingerprint !== "string") {
    return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("public_lists")
    .delete()
    .eq("fingerprint", fingerprint);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
