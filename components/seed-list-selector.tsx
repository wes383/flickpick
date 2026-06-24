"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  Plus,
  ChevronRight,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { TmdbImage } from "@/components/tmdb-image";
import {
  presetLists,
  loadPresetList,
  getPresetListSize,
} from "@/lib/preset-lists";
import { resolveSeedListEntries, deduplicateMovies } from "@/lib/seed-resolver";
import type { Movie, SeedListEntry } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GENRE_ZH: Record<string, string> = {
  Action: "动作",
  Adventure: "冒险",
  Animation: "动画",
  Comedy: "喜剧",
  Crime: "犯罪",
  Documentary: "纪录片",
  Drama: "剧情",
  Family: "家庭",
  Fantasy: "奇幻",
  History: "历史",
  Horror: "恐怖",
  Music: "音乐",
  Mystery: "悬疑",
  Romance: "爱情",
  "Science Fiction": "科幻",
  "TV Movie": "电视电影",
  Thriller: "惊悚",
  War: "战争",
  Western: "西部",
};

const AWARD_ZH: Record<string, string> = {
  Picture: "最佳影片",
  Director: "最佳导演",
  Actor: "最佳男主角",
  Actress: "最佳女主角",
  "Supporting Actor": "最佳男配角",
  "Supporting Actress": "最佳女配角",
  Writing: "最佳编剧",
  Cinematography: "最佳摄影",
  "Film Editing": "最佳剪辑",
  "Production Design": "最佳制作设计",
  "Costume Design": "最佳服装设计",
  "Makeup & Hairstyling": "最佳化妆与发型",
  Sound: "最佳音响",
  "Visual Effects": "最佳视觉效果",
  "Original Score": "最佳原创配乐",
  "Original Song": "最佳原创歌曲",
  "Animated Feature": "最佳动画长片",
  Documentary: "最佳纪录片",
  "International Feature": "最佳国际影片",
  "Short Film": "最佳真人短片",
  Other: "其他",
  // Cannes
  "Best Actor": "最佳男演员",
  "Best Actress": "最佳女演员",
  "Best Director": "最佳导演",
  "Best Screenplay": "最佳编剧",
  "Caméra d'Or": "金摄影机奖",
  "Grand Prix": "评审团大奖",
  "Jury Prize": "评审团奖",
  "Palme d'Or": "金棕榈奖",
  // Berlin
  "Golden Bear - Best Film": "金熊奖 - 最佳影片",
  "Silver Bear Grand Jury Prize": "银熊奖 - 评审团大奖",
  "Silver Bear Jury Prize": "银熊奖 - 评审团奖",
  "Alfred Bauer Prize": "阿尔弗雷德·鲍尔奖",
  // Venice
  "Golden Lion - Best Film": "金狮奖 - 最佳影片",
  "Grand Jury Prize": "评审团大奖",
};

interface SeedListSelectorProps {
  onAddMovies: (movies: Movie[]) => void;
  selectedMovieIds: Set<number>;
}

type View = "list" | "filter" | "preview";

export function SeedListSelector({
  onAddMovies,
  selectedMovieIds,
}: SeedListSelectorProps) {
  const { t, language } = useI18n();
  const tmdbLang = toTmdbLanguage(language);
  const zh = language === "zh";

  // View state
  const [view, setView] = useState<View>("list");

  // List view state
  const [listSizes, setListSizes] = useState<Record<string, number>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filter view state
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [entries, setEntries] = useState<SeedListEntry[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([0, 0]);
  const [rankRange, setRankRange] = useState<[number, number]>([0, 0]);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedAwards, setSelectedAwards] = useState<Set<string>>(new Set());

  // Resolve state
  const [resolving, setResolving] = useState(false);
  const [progress, setProgress] = useState<{
    resolved: number;
    total: number;
  } | null>(null);

  // Preview state
  const [resolvedMovies, setResolvedMovies] = useState<Movie[]>([]);
  const [unmatchedEntries, setUnmatchedEntries] = useState<SeedListEntry[]>(
    []
  );
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [unmatchedExpanded, setUnmatchedExpanded] = useState(false);

  // Search state (for unmatched)
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);

  // Load list sizes on mount
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      presetLists.map(async (list) => {
        const size = await getPresetListSize(list.file);
        return [list.id, size] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      setListSizes(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data
  const selectedList = useMemo(
    () => presetLists.find((l) => l.id === selectedListId) || null,
    [selectedListId]
  );

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.genres?.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [entries]);

  const allAwards = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.award && set.add(e.award));
    return Array.from(set).sort();
  }, [entries]);

  const yearBounds = useMemo(() => {
    const years = entries
      .map((e) => e.year)
      .filter((y): y is number => y != null && !isNaN(y));
    if (years.length === 0) return [0, 0] as [number, number];
    return [Math.min(...years), Math.max(...years)] as [number, number];
  }, [entries]);

  const rankBounds = useMemo(() => {
    const ranks = entries
      .map((e) => e.rank)
      .filter((r): r is number => r != null && !isNaN(r));
    if (ranks.length === 0) return [0, 0] as [number, number];
    return [Math.min(...ranks), Math.max(...ranks)] as [number, number];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (
        e.year != null &&
        (e.year < yearRange[0] || e.year > yearRange[1])
      )
        return false;
      if (
        e.rank != null &&
        (e.rank < rankRange[0] || e.rank > rankRange[1])
      )
        return false;
      if (
        selectedGenres.size > 0 &&
        (!e.genres || !e.genres.some((g) => selectedGenres.has(g)))
      )
        return false;
      if (
        selectedAwards.size > 0 &&
        (!e.award || !selectedAwards.has(e.award))
      )
        return false;
      return true;
    });
  }, [entries, yearRange, rankRange, selectedGenres, selectedAwards]);

  const handleLoadList = async (listId: string, file: string) => {
    setLoadingId(listId);
    try {
      const loaded = await loadPresetList(file);
      if (loaded.length === 0) {
        toast.error(zh ? "此榜单为空" : "This list is empty");
        return;
      }

      const years = loaded
        .map((e) => e.year)
        .filter((y): y is number => y != null && !isNaN(y));
      const minY = years.length > 0 ? Math.min(...years) : 0;
      const maxY = years.length > 0 ? Math.max(...years) : 0;

      const ranks = loaded
        .map((e) => e.rank)
        .filter((r): r is number => r != null && !isNaN(r));
      const minR = ranks.length > 0 ? Math.min(...ranks) : 0;
      const maxR = ranks.length > 0 ? Math.max(...ranks) : 0;

      setEntries(loaded);
      setSelectedListId(listId);
      setYearRange([minY, maxY]);
      setRankRange([minR, maxR]);
      setSelectedGenres(new Set());
      setSelectedAwards(new Set());
      setResolvedMovies([]);
      setUnmatchedEntries([]);
      setProgress(null);
      setView("filter");
    } catch {
      toast.error(t.setup.resolveError);
    } finally {
      setLoadingId(null);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedListId(null);
    setEntries([]);
    setResolvedMovies([]);
    setUnmatchedEntries([]);
    setProgress(null);
    setSelectedGenres(new Set());
    setSelectedAwards(new Set());
    setSearchingIndex(null);
    setSearchResults([]);
  };

  const handleStartResolve = async () => {
    setResolving(true);
    setProgress({ resolved: 0, total: filteredEntries.length });
    setView("preview");
    try {
      const { movies, resolved, total, unmatched } =
        await resolveSeedListEntries(
          filteredEntries,
          tmdbLang,
          (resolvedCount, totalCount) => {
            setProgress({ resolved: resolvedCount, total: totalCount });
          }
        );
      setProgress(null);
      const deduped = deduplicateMovies(movies);
      setResolvedMovies(deduped);
      setUnmatchedEntries(unmatched);

      if (resolved < total) {
        toast.warning(
          zh
            ? `成功解析 ${resolved}/${total} 部电影`
            : `Resolved ${resolved} of ${total} films`
        );
      } else {
        toast.success(
          zh
            ? `解析了 ${resolved} 部电影`
            : `Resolved ${resolved} films`
        );
      }
    } catch {
      toast.error(t.setup.resolveError);
    } finally {
      setResolving(false);
    }
  };

  const handleAddAll = () => {
    onAddMovies(newResults);
    toast.success(
      zh ? `添加了 ${newResults.length} 部电影` : `Added ${newResults.length} films`
    );
  };

  const handleAddOne = (movie: Movie) => {
    onAddMovies([movie]);
    toast.success(t.setup.added);
  };

  const handleUnmatchedSearch = async (index: number) => {
    const entry = unmatchedEntries[index];
    setSearchingIndex(index);
    setSearchQuery(entry.title || "");
    await executeSearch(entry.title || "");
  };

  const handleCloseSearch = () => {
    setSearchingIndex(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const params = new URLSearchParams({ query });
      const res = await fetch(`/api/tmdb/search?${params}`);
      if (!res.ok) {
        setSearchResults([]);
        return;
      }
      const data = await res.json();
      let results: Movie[] = data.results || [];
      if (results.length > 0 && tmdbLang) {
        results = await Promise.all(
          results.slice(0, 8).map(async (movie: Movie) => {
            try {
              const detailParams = new URLSearchParams({
                tmdbId: String(movie.id),
                lang: tmdbLang,
              });
              const detailRes = await fetch(
                `/api/tmdb/movie?${detailParams}`
              );
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                return detailData.result || movie;
              }
            } catch {}
            return movie;
          })
        );
      }
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleMatchEntry = (index: number, movie: Movie) => {
    setResolvedMovies((prev) => [...prev, movie]);
    setUnmatchedEntries((prev) => prev.filter((_, i) => i !== index));
    handleCloseSearch();
    toast.success(zh ? `已匹配: ${movie.title}` : `Matched: ${movie.title}`);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  };

  const toggleAward = (award: string) => {
    setSelectedAwards((prev) => {
      const next = new Set(prev);
      if (next.has(award)) next.delete(award);
      else next.add(award);
      return next;
    });
  };

  const newResults = resolvedMovies.filter(
    (m) => !selectedMovieIds.has(m.id)
  );
  const addedCount = resolvedMovies.length - newResults.length;
  const newCount = newResults.length;

  // === LIST VIEW ===
  if (view === "list") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.setup.presetSubtitle}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {presetLists.map((list) => {
            const isLoading = loadingId === list.id;
            return (
              <Card key={list.id} className="p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {zh ? list.nameZh : list.name}
                    </h3>
                    {listSizes[list.id] !== undefined &&
                      listSizes[list.id] > 0 && (
                        <Badge variant="secondary">
                          {listSizes[list.id]} {t.setup.movies}
                        </Badge>
                      )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {zh ? list.descriptionZh : list.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadList(list.id, list.file)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {isLoading ? t.setup.loadingList : t.setup.loadList}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // === FILTER VIEW ===
  if (view === "filter") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              {zh ? selectedList?.nameZh : selectedList?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {entries.length} {t.setup.movies}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="size-4" />
            {t.setup.presetBackToList}
          </Button>
        </div>

        <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
          {/* Year range filter */}
          {yearBounds[0] !== yearBounds[1] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t.setup.yearRange}
                </Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {yearRange[0]} — {yearRange[1]}
                </span>
              </div>
              <Slider
                min={yearBounds[0]}
                max={yearBounds[1]}
                step={1}
                value={yearRange}
                onValueChange={(v) =>
                  setYearRange([v[0], v[1]] as [number, number])
                }
              />
            </div>
          )}

          {/* Rank range filter */}
          {rankBounds[0] !== rankBounds[1] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t.setup.presetRankRange}
                </Label>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {rankRange[0]} — {rankRange[1]}
                </span>
              </div>
              <Slider
                min={rankBounds[0]}
                max={rankBounds[1]}
                step={1}
                value={rankRange}
                onValueChange={(v) =>
                  setRankRange([v[0], v[1]] as [number, number])
                }
              />
            </div>
          )}

          {/* Genre filter */}
          {allGenres.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t.setup.genres}</Label>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      selectedGenres.has(genre)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {zh ? (GENRE_ZH[genre] ?? genre) : genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Award filter */}
          {allAwards.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t.setup.presetAward}
              </Label>
              <div className="flex flex-wrap gap-2">
                {allAwards.map((award) => (
                  <button
                    key={award}
                    onClick={() => toggleAward(award)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      selectedAwards.has(award)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {zh ? (AWARD_ZH[award] ?? award) : award}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleStartResolve}
          disabled={filteredEntries.length === 0 || resolving}
          className="w-full"
        >
          {resolving ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : null}
          {t.setup.csvStartResolve} (
          {t.setup.csvEntriesAfterFilter.replace(
            "{count}",
            String(filteredEntries.length)
          )}
          )
        </Button>
      </div>
    );
  }

  // === PREVIEW VIEW ===
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {zh ? selectedList?.nameZh : selectedList?.name}
        </h3>
        <Button variant="ghost" size="sm" onClick={handleBackToList}>
          <ArrowLeft className="size-4" />
          {t.setup.presetBackToList}
        </Button>
      </div>

      {resolving && progress && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t.setup.presetResolving
                .replace("{resolved}", String(progress.resolved))
                .replace("{total}", String(progress.total))}
            </span>
            <span>
              {Math.round((progress.resolved / progress.total) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{
                width: `${(progress.resolved / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {resolvedMovies.length > 0 && (
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
          {resultsExpanded &&
            (newResults.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t.setup.allAdded}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-8">
                {newResults.map((movie) => (
                  <div
                    key={movie.id}
                    className="group/poster relative space-y-1.5"
                  >
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
                    <p className="text-xs font-medium line-clamp-1">
                      {movie.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movie.year}
                    </p>
                  </div>
                ))}
              </div>
            ))}

          {unmatchedEntries.length > 0 && (
            <div className="space-y-3 border-t border-border/50 pt-4">
              <button
                onClick={() => setUnmatchedExpanded((prev) => !prev)}
                className="flex items-center gap-2 text-left group"
              >
                <ChevronRight
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    unmatchedExpanded && "rotate-90"
                  )}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {t.setup.csvUnmatched.replace(
                    "{count}",
                    String(unmatchedEntries.length)
                  )}
                </span>
              </button>

              {unmatchedExpanded && (
                <div className="space-y-2">
                  {unmatchedEntries.map((entry, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 p-2">
                        <span className="flex-1 truncate text-sm">
                          {entry.title}
                        </span>
                        {entry.year && (
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                            {entry.year}
                          </span>
                        )}
                        {searchingIndex === index ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCloseSearch}
                          >
                            <X className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUnmatchedSearch(index)}
                          >
                            <Search className="size-3.5" />
                            {t.setup.csvUnmatchedSearch}
                          </Button>
                        )}
                      </div>

                      {searchingIndex === index && (
                        <div className="space-y-2 pl-2">
                          <div className="flex gap-2">
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  executeSearch(searchQuery);
                                }
                              }}
                              placeholder={
                                zh ? "搜索电影..." : "Search for a film..."
                              }
                              className="h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => executeSearch(searchQuery)}
                              disabled={searching}
                            >
                              {searching ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Search className="size-3.5" />
                              )}
                            </Button>
                          </div>

                          {searching && (
                            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                              <Loader2 className="size-3 animate-spin" />
                              {zh ? "搜索中..." : "Searching..."}
                            </div>
                          )}

                          {!searching && searchResults.length > 0 && (
                            <div className="max-h-48 space-y-1 overflow-y-auto">
                              {searchResults.slice(0, 8).map((movie) => (
                                <div
                                  key={movie.id}
                                  className="flex items-center gap-3 rounded-md p-1.5 hover:bg-muted/30 transition-colors"
                                >
                                  {movie.posterPath ? (
                                    <TmdbImage
                                      path={movie.posterPath}
                                      size="w92"
                                      alt={movie.title}
                                      className="h-10 w-7 shrink-0 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-7 shrink-0 rounded bg-muted" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {movie.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {movie.year}
                                      {movie.voteCount != null
                                        ? ` · ${movie.voteCount} votes`
                                        : ""}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleMatchEntry(index, movie)
                                    }
                                  >
                                    {t.setup.csvUnmatchedMatch}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {!searching &&
                            searchQuery &&
                            searchResults.length === 0 && (
                              <p className="py-2 text-xs text-muted-foreground">
                                {zh ? "无结果" : "No results"}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!resolving && resolvedMovies.length === 0 && progress === null && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t.setup.presetNoResults}
        </p>
      )}
    </div>
  );
}
