"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LayoutList, AlignJustify, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { fetchSiteTop100, fetchMoviesBatch } from "@/lib/public-api";
import type { Movie, SiteTopItem } from "@/types";

const PAGE_SIZE = 20;
const BATCH_SIZE = 50; // /api/tmdb/batch 单次最多 50 个
type ViewMode = "compact" | "cards";

export function SiteTop100() {
  const { t, language } = useI18n();
  const [items, setItems] = useState<SiteTopItem[]>([]);
  const [movieMap, setMovieMap] = useState<Record<number, Movie>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setVisibleCount(PAGE_SIZE);
      try {
        const top = await fetchSiteTop100();
        if (cancelled) return;
        setItems(top);

        // 100 个 ID 分 2 批拉电影详情（后端单批最多 50）
        const ids = top.map((i) => i.tmdbId);
        const langCode = toTmdbLanguage(language);
        const merged: Record<number, Movie> = {};
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
          const slice = ids.slice(i, i + BATCH_SIZE);
          const movies = await fetchMoviesBatch(slice, langCode);
          Object.assign(merged, movies);
        }
        if (cancelled) return;
        setMovieMap(merged);
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

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );
  const hasMore = visibleCount < items.length;

  // 无限滚动：sentinel 进入视口时再加载一批
  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, items.length));
  }, [items.length]);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  const toggleExpand = (tmdbId: number) => {
    setExpandedId((prev) => (prev === tmdbId ? null : tmdbId));
  };

  return (
    <section className="space-y-3">
      {loading ? (
        <>
          <ViewSwitcher value={viewMode} onChange={setViewMode} t={t} />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t.community.empty}
        </p>
      ) : (
        <>
          <ViewSwitcher value={viewMode} onChange={setViewMode} t={t} />

          {viewMode === "compact" ? (
            <CompactList
              visibleItems={visibleItems}
              movieMap={movieMap}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              t={t}
            />
          ) : (
            <CardList
              visibleItems={visibleItems}
              movieMap={movieMap}
              expandedId={expandedId}
              onToggleExpand={toggleExpand}
              t={t}
            />
          )}

          {hasMore ? (
            <div
              ref={sentinelRef}
              className="flex justify-center py-4 text-xs text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function ViewSwitcher({
  value,
  onChange,
  t,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="flex justify-end">
      <div className="inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5">
        <button
          onClick={() => onChange("cards")}
          aria-label={t.community.viewCards}
          title={t.community.viewCards}
          className={cn(
            "flex items-center justify-center rounded-md size-7 transition-colors",
            value === "cards"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={value === "cards"}
        >
          <LayoutList className="size-3.5" />
        </button>
        <button
          onClick={() => onChange("compact")}
          aria-label={t.community.viewCompact}
          title={t.community.viewCompact}
          className={cn(
            "flex items-center justify-center rounded-md size-7 transition-colors",
            value === "compact"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={value === "compact"}
        >
          <AlignJustify className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CompactList({
  visibleItems,
  movieMap,
  expandedId,
  onToggleExpand,
  t,
}: {
  visibleItems: SiteTopItem[];
  movieMap: Record<number, Movie>;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="rounded-lg border border-border/50 divide-y divide-border/50 overflow-hidden">
      {visibleItems.map((item, index) => {
        const movie = movieMap[item.tmdbId];
        const rank = index + 1;
        const isExpanded = expandedId === item.tmdbId;
        const hasOverview = !!movie?.overview;
        return (
          <div key={item.tmdbId}>
            <button
              onClick={() => hasOverview && onToggleExpand(item.tmdbId)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-secondary/30",
                isExpanded && "bg-secondary/20"
              )}
            >
              <div className="w-10 flex-shrink-0 text-center text-2xl md:text-3xl font-light text-muted-foreground/40 tabular-nums">
                {rank}
              </div>

              <a
                href={`https://kino.wesluma.com/movie/${item.tmdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-muted"
              >
                {movie?.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${movie.posterPath}`}
                    alt={movie?.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                    {movie?.title?.[0] ?? "?"}
                  </div>
                )}
              </a>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-medium truncate">
                    {movie?.title ?? `#${item.tmdbId}`}
                  </h3>
                  {movie?.year ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {movie.year}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {[
                    movie?.genres?.slice(0, 3).join(" · "),
                    movie?.director,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground tabular-nums flex-shrink-0">
                <span>
                  {t.community.score}: {item.score}
                </span>
                <span>
                  {t.community.appearances} {item.appearanceCount}
                </span>
              </div>

              {hasOverview ? (
                <ChevronDown
                  className={cn(
                    "size-4 flex-shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              ) : (
                <span className="w-4 flex-shrink-0" />
              )}
            </button>

            {isExpanded && hasOverview ? (
              <div className="px-12 py-2 bg-muted/20 text-xs text-muted-foreground leading-relaxed">
                {movie.overview}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CardList({
  visibleItems,
  movieMap,
  expandedId,
  onToggleExpand,
  t,
}: {
  visibleItems: SiteTopItem[];
  movieMap: Record<number, Movie>;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const movie = movieMap[item.tmdbId];
        const rank = index + 1;
        const isExpanded = expandedId === item.tmdbId;
        const hasOverview = !!movie?.overview;
        return (
          <div key={item.tmdbId}>
            <button
              onClick={() => hasOverview && onToggleExpand(item.tmdbId)}
              className={cn(
                "w-full flex items-center gap-4 rounded-xl border border-border/50 p-4 text-left transition-colors hover:bg-secondary/30",
                isExpanded && "bg-secondary/20"
              )}
            >
              <div className="relative flex w-12 flex-shrink-0 justify-center md:w-16">
                <span className="text-5xl md:text-7xl font-light text-muted-foreground/30 tabular-nums">
                  {rank}
                </span>
              </div>

              <a
                href={`https://kino.wesluma.com/movie/${item.tmdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm md:h-36 md:w-24"
              >
                {movie?.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                    alt={movie?.title}
                    loading="lazy"
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
                  {movie?.year > 0 ? <span>{movie.year}</span> : null}
                  {movie?.genres && movie.genres.length > 0 ? (
                    <span> · {movie.genres.slice(0, 3).join(", ")}</span>
                  ) : null}
                </p>
                {movie?.director ? (
                  <p className="text-sm text-muted-foreground">
                    {t.community.director}: {movie.director}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {t.community.score}: {item.score} ·{" "}
                  {t.community.appearances} {item.appearanceCount}
                </p>
              </div>

              {hasOverview ? (
                <ChevronDown
                  className={cn(
                    "size-5 flex-shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              ) : null}
            </button>

            {isExpanded && hasOverview ? (
              <div className="mx-4 mb-1 rounded-b-xl border border-t-0 border-border/50 bg-muted/20 px-4 py-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
