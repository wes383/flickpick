import type { RankingSession, Settings, Language, TournamentState } from "@/types";

const STORAGE_VERSION = 3;
const SESSION_KEY = "flickpick:session";
const SETTINGS_KEY = "flickpick:settings";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function migrateSession(data: unknown): RankingSession {
  const session = data as Partial<RankingSession> & {
    ratings?: unknown;
    tournament?: unknown;
    history?: unknown;
  };

  return {
    movies: session.movies ?? [],
    tournament: (session.tournament as TournamentState | null) ?? null,
    comparisons: session.comparisons ?? [],
    history: (session.history as TournamentState[]) ?? [],
    createdAt: session.createdAt ?? Date.now(),
    updatedAt: session.updatedAt ?? Date.now(),
  };
}

export function getSession(): RankingSession | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return migrateSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSession(session: RankingSession): void {
  if (!isClient()) return;
  session.updatedAt = Date.now();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function createSession(): RankingSession {
  const now = Date.now();
  return {
    movies: [],
    tournament: null,
    comparisons: [],
    history: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addMoviesToSession(
  session: RankingSession,
  movies: import("@/types").Movie[]
): RankingSession {
  const existingIds = new Set(session.movies.map((m) => m.id));
  const newMovies = movies.filter((m) => !existingIds.has(m.id));

  const updated: RankingSession = {
    ...session,
    movies: [...session.movies, ...newMovies],
    tournament: session.tournament,
    comparisons: [...session.comparisons],
    history: [...session.history],
  };

  return updated;
}

export function removeMovieFromSession(
  session: RankingSession,
  movieId: number
): RankingSession {
  const updated: RankingSession = {
    ...session,
    movies: session.movies.filter((m) => m.id !== movieId),
    tournament: null,
    comparisons: session.comparisons.filter(
      (c) => c.movieAId !== movieId && c.movieBId !== movieId
    ),
    history: [],
  };
  return updated;
}

export function clearSession(): void {
  if (!isClient()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function getSettings(): Settings {
  if (!isClient()) {
    return { language: "en" };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { language: getBrowserLanguage() };
    }
    const parsed = JSON.parse(raw) as Partial<Settings> & { minComparisonsPerMovie?: number };
    return { language: parsed.language ?? getBrowserLanguage() };
  } catch {
    return { language: "en" };
  }
}

export function saveSettings(settings: Settings): void {
  if (!isClient()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function getBrowserLanguage(): Language {
  if (!isClient()) return "en";
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("zh") ? "zh" : "en";
}

export function getMovieCacheKey(imdbId: string): string {
  return `flickpick:movie:v2:imdb:${imdbId}`;
}

export function cacheMovieByImdb(
  imdbId: string,
  movie: import("@/types").Movie
): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(getMovieCacheKey(imdbId), JSON.stringify(movie));
  } catch {
    // storage full, ignore
  }
}

export function getCachedMovieByImdb(
  imdbId: string
): import("@/types").Movie | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(getMovieCacheKey(imdbId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const USERNAME_KEY = "flickpick:username";

export function getUsername(): string | null {
  if (!isClient()) return null;
  try {
    return localStorage.getItem(USERNAME_KEY);
  } catch {
    return null;
  }
}

export function setUsername(name: string): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(USERNAME_KEY, name);
  } catch {
    // ignore storage errors
  }
}
