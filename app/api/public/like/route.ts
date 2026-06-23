import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

interface LikeBody {
  listId?: string;
  likerFingerprint?: string;
}

export async function POST(request: NextRequest) {
  let body: LikeBody;
  try {
    body = (await request.json()) as LikeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listId, likerFingerprint } = body;
  if (!listId || !likerFingerprint) {
    return NextResponse.json({ error: "Missing listId or likerFingerprint" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: list } = await supabase
    .from("public_lists")
    .select("fingerprint, like_count")
    .eq("id", listId)
    .maybeSingle();

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (list.fingerprint === likerFingerprint) {
    return NextResponse.json({ error: "Cannot like your own list" }, { status: 400 });
  }

  const { error: insertError } = await supabase
    .from("public_likes")
    .insert({ list_id: listId, liker_fingerprint: likerFingerprint });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Already liked" }, { status: 409 });
    }
    return NextResponse.json({ error: "Like failed" }, { status: 500 });
  }

  const newCount = (list.like_count ?? 0) + 1;
  await supabase
    .from("public_lists")
    .update({ like_count: newCount })
    .eq("id", listId);

  return NextResponse.json({ liked: true, likeCount: newCount });
}

export async function DELETE(request: NextRequest) {
  let body: LikeBody;
  try {
    body = (await request.json()) as LikeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listId, likerFingerprint } = body;
  if (!listId || !likerFingerprint) {
    return NextResponse.json({ error: "Missing listId or likerFingerprint" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  const { data: deleted } = await supabase
    .from("public_likes")
    .delete()
    .eq("list_id", listId)
    .eq("liker_fingerprint", likerFingerprint)
    .select("list_id");

  if (!deleted || deleted.length === 0) {
    const { data: list } = await supabase
      .from("public_lists")
      .select("like_count")
      .eq("id", listId)
      .maybeSingle();
    return NextResponse.json({ liked: false, likeCount: list?.like_count ?? 0 });
  }

  const { data: list } = await supabase
    .from("public_lists")
    .select("like_count")
    .eq("id", listId)
    .maybeSingle();

  const newCount = Math.max((list?.like_count ?? 1) - 1, 0);
  await supabase
    .from("public_lists")
    .update({ like_count: newCount })
    .eq("id", listId);

  return NextResponse.json({ liked: false, likeCount: newCount });
}
