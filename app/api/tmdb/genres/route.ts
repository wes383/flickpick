import { NextRequest, NextResponse } from "next/server";
import { tmdbGetGenres } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const lang = searchParams.get("lang") || undefined;
    const genres = await tmdbGetGenres(lang);
    return NextResponse.json({ genres });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch genres";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
