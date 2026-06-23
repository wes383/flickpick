import { NextRequest, NextResponse } from "next/server";
import { tmdbGetMovie } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = parseInt(searchParams.get("tmdbId") || "", 10);

  if (!tmdbId) {
    return NextResponse.json(
      { error: "tmdbId parameter is required" },
      { status: 400 }
    );
  }

  try {
    const lang = searchParams.get("lang") || undefined;
    const movie = await tmdbGetMovie(tmdbId, lang);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json({ result: movie });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch movie";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}