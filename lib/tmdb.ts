import type { Movie } from "@/types";
import { runWithConcurrency } from "@/lib/concurrency";

const TMDB_BASE = "https://api.themoviedb.org/3";
const MAX_CONCURRENT = 10;
const MAX_RETRIES = 3;
const BASE_RETRY_MS = 500;

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  imdb_id?: string;
  credits?: {
    crew: { job: string; name: string }[];
  };
}

export interface TmdbGenre {
  id: number;
  name: string;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export function mapTmdbMovie(tmdb: TmdbMovie): Movie {
  const year = tmdb.release_date
    ? parseInt(tmdb.release_date.split("-")[0], 10)
    : 0;

  const director = tmdb.credits?.crew.find(
    (c) => c.job === "Director"
  )?.name;

  return {
    id: tmdb.id,
    tmdbId: tmdb.id,
    imdbId: tmdb.imdb_id,
    title: tmdb.title,
    originalTitle: tmdb.original_title,
    year: isNaN(year) ? 0 : year,
    posterPath: tmdb.poster_path,
    overview: tmdb.overview,
    voteAverage: tmdb.vote_average,
    voteCount: tmdb.vote_count,
    genres: (tmdb.genre_ids || []).map((id) => GENRE_MAP[id]).filter(Boolean),
    originalLanguage: tmdb.original_language,
    director: director || undefined,
  };
}

export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (res.status === 429) {
      const wait = BASE_RETRY_MS * Math.pow(2, attempt);
      await sleep(wait);
      lastError = new Error(`TMDB API error: 429`);
      continue;
    }

    if (!res.ok) {
      throw new Error(`TMDB API error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  throw lastError ?? new Error("TMDB API error: 429 after retries");
}

export async function tmdbSearch(
  query: string,
  page = 1,
  language?: string
): Promise<Movie[]> {
  // Always fetch with en-US first to get English posters
  const enParams: Record<string, string> = {
    query,
    page: String(page),
    include_adult: "false",
    language: "en-US",
  };
  const enData = await tmdbFetch<{ results: TmdbMovie[] }>("/search/movie", enParams);
  const enMovies = enData.results.map(mapTmdbMovie);

  // If user language is not English, fetch localized text and merge
  if (language && language !== "en-US") {
    try {
      const localizedParams: Record<string, string> = {
        query,
        page: String(page),
        include_adult: "false",
        language,
      };
      const localizedData = await tmdbFetch<{ results: TmdbMovie[] }>("/search/movie", localizedParams);
      const localizedMovies = localizedData.results.map(mapTmdbMovie);
      const localizedMap = new Map(localizedMovies.map((m) => [m.id, m]));
      return enMovies.map((enMovie) => {
        const localized = localizedMap.get(enMovie.id);
        return localized ? { ...localized, posterPath: enMovie.posterPath } : enMovie;
      });
    } catch {
      // Fall back to English if localized fetch fails
    }
  }

  return enMovies;
}

export async function tmdbGetMovie(
  tmdbId: number,
  language?: string
): Promise<Movie | null> {
  try {
    // Always fetch with en-US first to get English poster
    const enParams: Record<string, string> = {
      append_to_response: "credits",
      language: "en-US",
    };
    const enData = await tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, enParams);
    const enMovie = mapTmdbMovie(enData);

    // If user language is not English, fetch localized text and merge
    if (language && language !== "en-US") {
      try {
        const localizedParams: Record<string, string> = {
          append_to_response: "credits",
          language,
        };
        const localizedData = await tmdbFetch<TmdbMovie>(`/movie/${tmdbId}`, localizedParams);
        const localizedMovie = mapTmdbMovie(localizedData);
        return { ...localizedMovie, posterPath: enMovie.posterPath };
      } catch {
        // Fall back to English if localized fetch fails
      }
    }

    return enMovie;
  } catch {
    return null;
  }
}

export async function tmdbGetMoviesBatch(
  tmdbIds: number[],
  language?: string
): Promise<Movie[]> {
  const results = await runWithConcurrency(tmdbIds, MAX_CONCURRENT, (id) =>
    tmdbGetMovie(id, language)
  );
  return results.filter((m): m is Movie => m !== null);
}

export async function tmdbFindByImdbId(
  imdbId: string,
  language?: string
): Promise<Movie | null> {
  try {
    // Always fetch with en-US first to get English poster
    const enParams: Record<string, string> = {
      external_source: "imdb_id",
      language: "en-US",
    };
    const enData = await tmdbFetch<{
      movie_results: TmdbMovie[];
    }>("/find/" + imdbId, enParams);
    if (enData.movie_results.length === 0) return null;
    const enMovie = mapTmdbMovie(enData.movie_results[0]);

    // If user language is not English, fetch localized text and merge
    if (language && language !== "en-US") {
      try {
        const localizedParams: Record<string, string> = {
          external_source: "imdb_id",
          language,
        };
        const localizedData = await tmdbFetch<{
          movie_results: TmdbMovie[];
        }>("/find/" + imdbId, localizedParams);
        if (localizedData.movie_results.length > 0) {
          const localizedMovie = mapTmdbMovie(localizedData.movie_results[0]);
          return { ...localizedMovie, posterPath: enMovie.posterPath };
        }
      } catch {
        // Fall back to English if localized fetch fails
      }
    }

    return enMovie;
  } catch {
    return null;
  }
}

export interface DiscoverParams {
  genres?: string;
  yearGte?: string;
  yearLte?: string;
  minRating?: string;
  minVotes?: string;
  language?: string;
  sort?: string;
  count?: number;
  uiLanguage?: string;
}

export async function tmdbDiscover(params: DiscoverParams): Promise<Movie[]> {
  const count = Math.min(params.count || 20, 500);
  const pagesNeeded = Math.ceil(count / 20);
  const allEnMovies: Movie[] = [];

  const sortMap: Record<string, string> = {
    popularity: "popularity.desc",
    rating: "vote_average.desc",
    vote_count: "vote_count.desc",
    release_date: "release_date.desc",
    title: "original_title.asc",
  };

  const buildApiParams = (page: number, language?: string): Record<string, string> => {
    const apiParams: Record<string, string> = {
      page: String(page),
      include_adult: "false",
      sort_by: sortMap[params.sort || "vote_count"] || sortMap.vote_count,
    };
    if (language) apiParams.language = language;
    if (params.minVotes) apiParams["vote_count.gte"] = params.minVotes;
    if (params.genres) apiParams.with_genres = params.genres;
    if (params.yearGte) apiParams["primary_release_date.gte"] = `${params.yearGte}-01-01`;
    if (params.yearLte) apiParams["primary_release_date.lte"] = `${params.yearLte}-12-31`;
    if (params.minRating) apiParams["vote_average.gte"] = params.minRating;
    if (params.language) apiParams.with_original_language = params.language;
    return apiParams;
  };

  // Fetch all pages with en-US for English posters
  for (let page = 1; page <= pagesNeeded; page++) {
    const data = await tmdbFetch<{ results: TmdbMovie[] }>(
      "/discover/movie",
      buildApiParams(page, "en-US")
    );
    allEnMovies.push(...data.results.map(mapTmdbMovie));
    if (data.results.length < 20) break;
  }

  // Sort by vote_count desc, then dedupe
  const sorted = allEnMovies
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, count);
  let result = Array.from(
    new Map(sorted.map((m) => [m.id, m])).values()
  );

  // If UI language is not English, fetch localized text and merge
  if (params.uiLanguage && params.uiLanguage !== "en-US") {
    try {
      const allLocalizedMovies: Movie[] = [];
      for (let page = 1; page <= pagesNeeded; page++) {
        const data = await tmdbFetch<{ results: TmdbMovie[] }>(
          "/discover/movie",
          buildApiParams(page, params.uiLanguage)
        );
        allLocalizedMovies.push(...data.results.map(mapTmdbMovie));
        if (data.results.length < 20) break;
      }
      const localizedMap = new Map(allLocalizedMovies.map((m) => [m.id, m]));
      result = result.map((enMovie) => {
        const localized = localizedMap.get(enMovie.id);
        return localized ? { ...localized, posterPath: enMovie.posterPath } : enMovie;
      });
    } catch {
      // Fall back to English if localized fetch fails
    }
  }

  return result;
}

export async function tmdbGetGenres(language?: string): Promise<TmdbGenre[]> {
  const params: Record<string, string> = {};
  if (language) params.language = language;
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list", params);
  return data.genres;
}
