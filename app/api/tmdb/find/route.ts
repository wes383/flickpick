import { NextRequest, NextResponse } from "next/server";
import { tmdbFindByImdbId } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imdbId = searchParams.get("imdb_id");

  if (!imdbId || !/^tt\d+$/.test(imdbId)) {
    return NextResponse.json(
      { error: "Valid imdb_id parameter is required (e.g. tt0111161)" },
      { status: 400 }
    );
  }

  try {
    const lang = searchParams.get("lang") || undefined;
    const movie = await tmdbFindByImdbId(imdbId, lang);
    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found", imdb_id: imdbId },
        { status: 404 }
      );
    }
    return NextResponse.json({ result: movie });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Find failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
