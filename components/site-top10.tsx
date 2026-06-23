"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { fetchSiteTop10, fetchMoviesBatch } from "@/lib/public-api";
import type { Movie, SiteTopItem } from "@/types";

export function SiteTop10() {
  const { t, language } = useI18n();
  const [items, setItems] = useState<SiteTopItem[]>([]);
  const [movieMap, setMovieMap] = useState<Record<number, Movie>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const top = await fetchSiteTop10();
        if (cancelled) return;
        setItems(top);
        const movies = await fetchMoviesBatch(
          top.map((i) => i.tmdbId),
          toTmdbLanguage(language)
        );
        if (cancelled) return;
        setMovieMap(movies);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const toggleExpand = (tmdbId: number) => {
    setExpandedId((prev) => (prev === tmdbId ? null : tmdbId));
  };

  return (
    <section className="space-y-3">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full flex items-center gap-4 rounded-xl border border-border/50 p-4"
            >
              <div className="relative flex w-12 flex-shrink-0 justify-center md:w-16">
                <Skeleton className="h-10 w-10 md:h-14 md:w-14 rounded" />
              </div>
              <Skeleton className="h-28 w-20 flex-shrink-0 rounded-lg md:h-36 md:w-24" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t.community.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const movie = movieMap[item.tmdbId];
            const isExpanded = expandedId === item.tmdbId;
            const hasOverview = movie?.overview;

            return (
              <div key={item.tmdbId}>
                <button
                  onClick={() => hasOverview && toggleExpand(item.tmdbId)}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border border-border/50 p-4 text-left transition-colors hover:bg-secondary/30",
                    isExpanded && "bg-secondary/20"
                  )}
                >
                  <div className="relative flex w-12 flex-shrink-0 justify-center md:w-16">
                    <span className="text-5xl md:text-7xl font-light text-muted-foreground/30 tabular-nums">
                      {index + 1}
                    </span>
                  </div>

                  <a
                    href={`https://kino.wesluma.com/movie/${item.tmdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm md:h-36 md:w-24"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {movie?.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                        alt={movie?.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                        {movie?.title}
                      </div>
                    )}
                  </a>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-medium leading-tight line-clamp-1">
                      {movie?.title ?? `#${item.tmdbId}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {movie?.year > 0 && <span>{movie.year}</span>}
                      {movie?.genres && movie.genres.length > 0 && (
                        <span> · {movie.genres.slice(0, 3).join(", ")}</span>
                      )}
                    </p>
                    {movie?.director && (
                      <p className="text-sm text-muted-foreground">
                        {t.community.director}: {movie.director}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t.community.score}: {item.score} · {t.community.appearances}:{" "}
                      {item.appearanceCount}
                    </p>
                  </div>

                  {hasOverview && (
                    <ChevronDown
                      className={cn(
                        "size-5 flex-shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>

                {isExpanded && hasOverview && (
                  <div className="mx-4 mb-1 rounded-b-xl border border-t-0 border-border/50 bg-muted/20 px-4 py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
