export interface Movie {
  id: number;
  tmdbId: number;
  imdbId?: string;
  title: string;
  originalTitle?: string;
  year: number;
  posterPath: string | null;
  overview: string;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  originalLanguage: string;
  director?: string;
}

export interface TournamentState {
  size: number;
  nodes: (number | null)[];
  phase: "building" | "extracting";
  topK: number[];
  pendingPair: [number, number] | null;
  totalComparisons: number;
}

export interface Comparison {
  id: string;
  movieAId: number;
  movieBId: number;
  winnerId: number;
  timestamp: number;
}

export interface RankingSession {
  movies: Movie[];
  tournament: TournamentState | null;
  comparisons: Comparison[];
  history: TournamentState[];
  createdAt: number;
  updatedAt: number;
}

export interface SeedListEntry {
  title?: string;
  year?: number;
  imdbId?: string;
  tmdbId?: number;
  rating?: number;
  rank?: number;
  genres?: string[];
  award?: string;
}

export interface SeedList {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  source: "preset" | "tmdb" | "csv" | "search";
  movies: Movie[];
}

export type Language = "en" | "zh";

export interface Settings {
  language: Language;
}

export const TOP_N = 10;

export interface PublicList {
  id: string;
  fingerprint: string;
  username: string;
  tmdbIds: number[];
  likeCount: number;
  createdAt: string;
  likedByMe: boolean;
}

export interface SiteTopItem {
  tmdbId: number;
  score: number;
  appearanceCount: number;
}
