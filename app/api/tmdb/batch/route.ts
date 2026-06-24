import { NextRequest, NextResponse } from "next/server";
import { tmdbGetMovie } from "@/lib/tmdb";
import { runWithConcurrency } from "@/lib/concurrency";

const BATCH_CONCURRENCY = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get("ids") || "";
  const lang = searchParams.get("lang") || undefined;

  const ids = Array.from(
    new Set(
      idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => parseInt(s, 10))
        .filter((n) => !isNaN(n))
    )
  ).slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json({});
  }

  const results = await runWithConcurrency(
    ids,
    BATCH_CONCURRENCY,
    async (id) => [id, await tmdbGetMovie(id, lang)] as const
  );

  const map: Record<number, unknown> = {};
  for (const [id, movie] of results) {
    if (movie) {
      map[id] = movie;
    }
  }

  return NextResponse.json(
    map,
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
