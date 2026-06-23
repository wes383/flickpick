import type { Movie, SeedListEntry } from "@/types";

const STAGGER_MS = 25;
const BATCH_SIZE = 50;
const BATCH_DELAY_MIN = 150;
const BATCH_DELAY_MAX = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveOne(
  entry: SeedListEntry,
  language?: string
): Promise<Movie | null> {
  // Priority 1: tmdbId — direct fetch, most reliable.
  if (entry.tmdbId) {
    try {
      const params = new URLSearchParams({ tmdbId: String(entry.tmdbId) });
      if (language) params.set("lang", language);
      const res = await fetch(`/api/tmdb/movie?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.result || null;
    } catch {
      return null;
    }
  }

  // Priority 2: imdbId — find via external source.
  if (entry.imdbId) {
    try {
      const params = new URLSearchParams({ imdb_id: entry.imdbId });
      if (language) params.set("lang", language);
      const res = await fetch(`/api/tmdb/find?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.result || null;
    } catch {
      return null;
    }
  }

  // Priority 3: title + year — search and match.
  if (entry.title && entry.year) {
    try {
      const params = new URLSearchParams({ query: entry.title });
      params.set("year", String(entry.year));
      const res = await fetch(`/api/tmdb/search?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const matched =
          data.results.find(
            (m: Movie) => Math.abs(m.year - entry.year!) <= 1
          ) || data.results[0];
        if (matched && matched.voteCount >= 50) {
          if (language) {
            const detailParams = new URLSearchParams({
              tmdbId: String(matched.id),
              lang: language,
            });
            const detailRes = await fetch(
              `/api/tmdb/movie?${detailParams}`
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              return detailData.result || matched;
            }
          }
          return matched;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function resolveSeedListEntries(
  entries: SeedListEntry[],
  language?: string,
  onProgress?: (resolved: number, total: number) => void
): Promise<{
  movies: Movie[];
  resolved: number;
  total: number;
  unmatched: SeedListEntry[];
}> {
  const movies: Movie[] = [];
  const unmatched: SeedListEntry[] = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((entry, j) =>
        sleep(j * STAGGER_MS).then(
          () =>
            resolveOne(entry, language) as Promise<
              Movie | null
            >
        )
      )
    );

    batch.forEach((entry, idx) => {
      const result = results[idx];
      if (result.status === "fulfilled" && result.value) {
        movies.push(result.value);
      } else {
        unmatched.push(entry);
      }
    });

    onProgress?.(movies.length, entries.length);

    if (i + BATCH_SIZE < entries.length) {
      await sleep(
        BATCH_DELAY_MIN + Math.random() * (BATCH_DELAY_MAX - BATCH_DELAY_MIN)
      );
    }
  }

  return { movies, resolved: movies.length, total: entries.length, unmatched };
}

export function deduplicateMovies(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  return movies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}