import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const fingerprint = request.nextUrl.searchParams.get("fingerprint");
  if (!fingerprint) {
    return NextResponse.json({ exists: false });
  }

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("public_lists")
    .select("id, fingerprint, username, tmdb_ids, like_count, created_at")
    .eq("fingerprint", fingerprint)
    .maybeSingle();

  return NextResponse.json({
    exists: !!data,
    list: data
      ? {
          id: data.id,
          fingerprint: data.fingerprint,
          username: data.username,
          tmdbIds: data.tmdb_ids || [],
          likeCount: data.like_count ?? 0,
          createdAt: data.created_at,
          likedByMe: false,
        }
      : null,
  });
}
