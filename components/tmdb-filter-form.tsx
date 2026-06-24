"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, ChevronRight, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { deduplicateMovies } from "@/lib/seed-resolver";
import type { Movie } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TmdbImage } from "@/components/tmdb-image";

interface TmdbFilterFormProps {
  onAddMovies: (movies: Movie[]) => void;
  selectedMovieIds: Set<number>;
}

interface Genre {
  id: number;
  name: string;
}

const LANGUAGE_OPTIONS = [
  { value: "" },
  { value: "en" },
  { value: "zh" },
  { value: "es" },
  { value: "fr" },
  { value: "de" },
  { value: "it" },
  { value: "ja" },
  { value: "ko" },
  { value: "pt" },
  { value: "ru" },
  { value: "hi" },
  { value: "ar" },
  { value: "da" },
  { value: "nl" },
  { value: "fi" },
  { value: "no" },
  { value: "pl" },
  { value: "sv" },
  { value: "tr" },
  { value: "vi" },
  { value: "th" },
  { value: "id" },
  { value: "ms" },
  { value: "cs" },
  { value: "el" },
  { value: "he" },
  { value: "hu" },
  { value: "ro" },
  { value: "uk" },
  { value: "bn" },
  { value: "tl" },
  { value: "ta" },
  { value: "fa" },
  { value: "bo" },
  { value: "bg" },
];

// TMDB standard genre ids, must match the order of t.setup.genreOptions
const GENRE_IDS = [
  28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
  10770, 53, 10752, 37,
];

export function TmdbFilterForm({
  onAddMovies,
  selectedMovieIds,
}: TmdbFilterFormProps) {
  const { t, language } = useI18n();
  const tmdbLang = toTmdbLanguage(language);
  const currentYear = new Date().getFullYear();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [yearRange, setYearRange] = useState<[number, number]>([1950, currentYear]);
  const [minRating, setMinRating] = useState(7);
  const [minVotes, setMinVotes] = useState(500);
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [resultsExpanded, setResultsExpanded] = useState(true);

  useEffect(() => {
    fetch(`/api/tmdb/genres?lang=${tmdbLang}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(() => {});
  }, [tmdbLang]);

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const selectLanguage = (code: string) => {
    setSelectedLanguage((prev) => (prev === code ? "" : code));
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        genres: selectedGenres.join(","),
        year_gte: String(yearRange[0]),
        year_lte: String(yearRange[1]),
        min_rating: String(minRating),
        language: selectedLanguage,
        lang: tmdbLang,
        sort: "vote_count",
        count: String(count),
      });
      const res = await fetch(`/api/tmdb/discover?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const deduped = deduplicateMovies(data.results || []);
      setResults(deduped);
      toast.success(`${deduped.length} ${t.setup.movies}`);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = () => {
    onAddMovies(newResults);
    toast.success(`${newResults.length} ${t.setup.movies}`);
  };

  const handleAddOne = (movie: Movie) => {
    onAddMovies([movie]);
    toast.success(t.setup.added);
  };

  const newResults = results.filter((m) => !selectedMovieIds.has(m.id));
  const addedCount = results.length - newResults.length;
  const newCount = newResults.length;

  return (
    <div className="space-y-10">
      <p className="text-sm text-muted-foreground">{t.setup.tmdbSubtitle}</p>

      <div className="space-y-8">
        {/* Genres */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t.setup.genres}</Label>
          <div className="flex flex-wrap gap-2">
            {GENRE_IDS.map((genreId, idx) => {
              const idStr = String(genreId);
              return (
                <Badge
                  key={genreId}
                  variant={
                    selectedGenres.includes(idStr) ? "default" : "outline"
                  }
                  className="cursor-pointer px-3 py-1.5 max-sm:min-h-11 max-sm:py-2.5 text-sm"
                  onClick={() => toggleGenre(idStr)}
                >
                  {t.setup.genreOptions[idx]}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t.setup.yearRange}</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {yearRange[0]} — {yearRange[1]}
            </span>
          </div>
          <Slider
            min={1920}
            max={currentYear}
            step={1}
            value={yearRange}
            onValueChange={(v) => setYearRange([v[0], v[1]] as [number, number])}
          />
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {t.setup.minRating}
            </Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {minRating.toFixed(1)}
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[minRating]}
            onValueChange={(v) => setMinRating(v[0])}
          />
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t.setup.language}</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang, idx) => (
              <Badge
                key={lang.value || "any"}
                variant={
                  selectedLanguage === lang.value ? "default" : "outline"
                }
                className="cursor-pointer px-3 py-1.5 max-sm:min-h-11 max-sm:py-2.5 text-sm"
                onClick={() => selectLanguage(lang.value)}
              >
                {t.setup.languageOptions[idx]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <Label className="text-sm font-medium">{t.setup.count}</Label>
              <span className="text-xs text-muted-foreground">
                {t.setup.sortedBy}
              </span>
            </div>
            <span className="text-sm tabular-nums text-muted-foreground">
              {count}
            </span>
          </div>
          <Slider
              min={10}
              max={500}
              step={10}
              value={[count]}
              onValueChange={(v) => setCount(v[0])}
            />
        </div>

        {/* Apply */}
        <div>
          <Button onClick={handleApply} disabled={loading} size="lg">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {loading ? t.setup.applying : t.setup.apply}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4 border-t border-border/50 pt-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setResultsExpanded((prev) => !prev)}
              className="flex items-center gap-2 text-left group"
            >
              <ChevronRight
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  resultsExpanded && "rotate-90"
                )}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {newResults.length} {t.setup.movies}
              </span>
              {addedCount > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  ({t.setup.alreadyAdded.replace("{count}", String(addedCount))})
                </span>
              )}
            </button>
            <Button size="sm" onClick={handleAddAll} disabled={newCount === 0}>
              {t.setup.add} ({newCount})
            </Button>
          </div>
          {resultsExpanded && (
            newResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t.setup.allAdded}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-8">
                {newResults.map((movie) => (
                  <div key={movie.id} className="group/poster relative space-y-1.5">
                    <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted relative">
                      {movie.posterPath ? (
                        <TmdbImage
                          path={movie.posterPath}
                          size="w200"
                          alt={movie.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                          {movie.title}
                        </div>
                      )}
                      <button
                        onClick={() => handleAddOne(movie)}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 opacity-0 transition-opacity group-hover/poster:opacity-100 max-sm:opacity-100 hover:bg-background"
                        aria-label={t.setup.add}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="text-xs font-medium line-clamp-1">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">{movie.year}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
