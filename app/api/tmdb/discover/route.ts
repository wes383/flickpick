import { NextRequest, NextResponse } from "next/server";
import { tmdbDiscover } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const movies = await tmdbDiscover({
      genres: searchParams.get("genres") || undefined,
      yearGte: searchParams.get("year_gte") || undefined,
      yearLte: searchParams.get("year_lte") || undefined,
      minRating: searchParams.get("min_rating") || undefined,
      minVotes: searchParams.get("min_votes") || undefined,
      language: searchParams.get("language") || undefined,
      sort: searchParams.get("sort") || undefined,
      count: parseInt(searchParams.get("count") || "20", 10),
      uiLanguage: searchParams.get("lang") || undefined,
    });
    return NextResponse.json({ results: movies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discover failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
