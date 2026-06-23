"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { deduplicateMovies } from "@/lib/seed-resolver";
import type { Movie } from "@/types";
import { toast } from "sonner";

interface MovieSearchProps {
  onAddMovies: (movies: Movie[]) => void;
  selectedMovieIds: Set<number>;
}

export function MovieSearch({
  onAddMovies,
  selectedMovieIds,
}: MovieSearchProps) {
  const { t, language } = useI18n();
  const tmdbLang = toTmdbLanguage(language);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(query)}&lang=${tmdbLang}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(deduplicateMovies(data.results || []));
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  }, [query, t, tmdbLang]);

  const handleAdd = (movie: Movie) => {
    onAddMovies([movie]);
    toast.success(t.setup.added);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.setup.searchSubtitle}</p>

      <div className="flex gap-2">
        <Input
          placeholder={t.setup.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} {t.setup.movies}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-8">
            {results.map((movie) => {
              const isAdded = selectedMovieIds.has(movie.id);
              return (
                <div key={movie.id} className="group/poster relative space-y-1.5">
                  <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted relative">
                    {movie.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
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
                      onClick={() => handleAdd(movie)}
                      disabled={isAdded}
                      className="absolute right-1 top-1 rounded-full bg-background/90 p-1.5 opacity-0 transition-opacity group-hover/poster:opacity-100 max-sm:opacity-100 hover:bg-background disabled:opacity-100 disabled:bg-primary disabled:text-primary-foreground"
                      aria-label={isAdded ? t.setup.added : t.setup.add}
                    >
                      {isAdded ? (
                        <Check className="size-3" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-medium line-clamp-1">
                    {movie.title}
                  </p>
                  {movie.year > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {movie.year}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t.setup.noResults}
        </p>
      )}
    </div>
  );
}
