import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import type { SiteTopItem } from "@/types";

interface ListRow {
  tmdb_ids: number[];
}

export async function GET() {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("public_lists")
    .select("tmdb_ids");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const rows = (data || []) as ListRow[];

  const scoreMap = new Map<number, { score: number; appearanceCount: number }>();

  for (const row of rows) {
    const ids = row.tmdb_ids || [];
    for (let i = 0; i < ids.length; i++) {
      const tmdbId = ids[i];
      const rank = i + 1;
      const points = Math.max(11 - rank, 1);
      const entry = scoreMap.get(tmdbId) ?? { score: 0, appearanceCount: 0 };
      entry.score += points;
      entry.appearanceCount += 1;
      scoreMap.set(tmdbId, entry);
    }
  }

  const items: SiteTopItem[] = Array.from(scoreMap.entries())
    .map(([tmdbId, val]) => ({
      tmdbId,
      score: val.score,
      appearanceCount: val.appearanceCount,
    }))
    .sort((a, b) => b.score - a.score || b.appearanceCount - a.appearanceCount)
    .slice(0, 10);

  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
