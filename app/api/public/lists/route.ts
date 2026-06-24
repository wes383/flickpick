import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import type { PublicList } from "@/types";

const PAGE_SIZE = 20;

interface ListRow {
  id: string;
  fingerprint: string;
  username: string;
  tmdb_ids: number[];
  like_count: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get("sort") === "likes" ? "likes" : "recent";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const likerFingerprint = searchParams.get("likerFingerprint") || "";

  const supabase = getSupabaseServer();

  const orderBy = sort === "likes" ? "like_count" : "created_at";
  const ascending = false;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data, error } = await supabase
    .from("public_lists")
    .select("id, fingerprint, username, tmdb_ids, like_count, created_at")
    .order(orderBy, { ascending })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 });
  }

  const rows = (data || []) as ListRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const pageRows = rows.slice(0, PAGE_SIZE);

  let likedSet = new Set<string>();
  if (likerFingerprint && pageRows.length > 0) {
    const listIds = pageRows.map((r) => r.id);
    const { data: likes } = await supabase
      .from("public_likes")
      .select("list_id")
      .eq("liker_fingerprint", likerFingerprint)
      .in("list_id", listIds);

    likedSet = new Set((likes || []).map((l: { list_id: string }) => l.list_id));
  }

  const items: PublicList[] = pageRows.map((row) => ({
    id: row.id,
    fingerprint: row.fingerprint,
    username: row.username,
    tmdbIds: row.tmdb_ids || [],
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at,
    likedByMe: likedSet.has(row.id),
  }));

  return NextResponse.json(
    { items, hasMore },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
