import { NextRequest, NextResponse } from "next/server";
import { tmdbSearch } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const lang = searchParams.get("lang") || undefined;
    const movies = await tmdbSearch(query, page, lang);
    return NextResponse.json({ results: movies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
