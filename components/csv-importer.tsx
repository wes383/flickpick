"use client";

import { useState, useRef, useMemo } from "react";
import { Upload, Loader2, FileText, Info, Filter, ChevronRight, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { parseCsv } from "@/lib/csv-parser";
import { resolveSeedListEntries, deduplicateMovies } from "@/lib/seed-resolver";
import { fetchWithRetry } from "@/lib/fetch-retry";
import type { Movie, SeedListEntry } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TmdbImage } from "@/components/tmdb-image";

interface CsvImporterProps {
  onAddMovies: (movies: Movie[]) => void;
  selectedMovieIds: Set<number>;
}

export function CsvImporter({
  onAddMovies,
  selectedMovieIds,
}: CsvImporterProps) {
  const { t, language } = useI18n();
  const tmdbLang = toTmdbLanguage(language);
  const [parsing, setParsing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [parsedCount, setParsedCount] = useState(0);
  const [source, setSource] = useState<string>("");
  const [maxRating, setMaxRating] = useState<number | undefined>(undefined);
  const [parsedEntries, setParsedEntries] = useState<SeedListEntry[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);

  const sliderMin = maxRating === 10 ? 1 : 0.5;
  const sliderMax = maxRating ?? 10;
  const sliderStep = maxRating === 10 ? 1 : 0.5;
  const [resolvedMovies, setResolvedMovies] = useState<Movie[]>([]);
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<{
    resolved: number;
    total: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [unmatchedExpanded, setUnmatchedExpanded] = useState(false);
  const [unmatchedEntries, setUnmatchedEntries] = useState<SeedListEntry[]>(
    []
  );
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);

  const ratingCount = useMemo(
    () => parsedEntries.filter((e) => e.rating != null).length,
    [parsedEntries]
  );

  const filteredEntries = useMemo(() => {
    if (minRating == null || minRating === sliderMin) return parsedEntries;
    return parsedEntries.filter(
      (e) => e.rating == null || e.rating >= minRating
    );
  }, [parsedEntries, minRating, sliderMin]);

  const handleFile = async (file: File) => {
    setParsing(true);
    setParsedCount(0);
    setResolvedMovies([]);
    setMinRating(null);
    setProgress(null);
    try {
      const text = await file.text();
      const result = parseCsv(text);
      setParsedCount(result.count);
      setSource(result.source.toUpperCase());
      setMaxRating(result.maxRating);
      setParsedEntries(result.entries);

      if (result.count === 0) {
        toast.error(t.setup.csvError);
        return;
      }

      toast.success(
        language === "zh"
          ? `从 ${result.source.toUpperCase()} 解析了 ${result.count} 条记录`
          : `Parsed ${result.count} entries from ${result.source.toUpperCase()}`
      );
    } catch {
      toast.error(t.setup.csvError);
    } finally {
      setParsing(false);
    }
  };

  const handleReset = () => {
    setParsedCount(0);
    setSource("");
    setMaxRating(undefined);
    setParsedEntries([]);
    setMinRating(null);
    setResolvedMovies([]);
    setProgress(null);
    setUnmatchedEntries([]);
    setUnmatchedExpanded(false);
    setSearchingIndex(null);
    setSearchResults([]);
  };

  const handleStartResolve = async () => {
    setResolving(true);
    setProgress({ resolved: 0, total: filteredEntries.length });
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
          language === "zh"
            ? `成功解析 ${resolved}/${total} 部电影`
            : `Resolved ${resolved} of ${total} films`
        );
      } else {
        toast.success(
          language === "zh"
            ? `解析了 ${resolved} 部电影`
            : `Resolved ${resolved} films`
        );
      }
    } catch {
      toast.error(t.setup.csvError);
    } finally {
      setResolving(false);
    }
  };

  const handleAddAll = () => {
    onAddMovies(newResults);
    toast.success(
      language === "zh"
        ? `添加了 ${newResults.length} 部电影`
        : `Added ${newResults.length} films`
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
      const res = await fetchWithRetry(`/api/tmdb/search?${params}`);
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
              const detailRes = await fetchWithRetry(
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
      toast.error(t.common.error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleMatchEntry = (index: number, movie: Movie) => {
    setResolvedMovies((prev) => [...prev, movie]);
    setUnmatchedEntries((prev) => prev.filter((_, i) => i !== index));
    handleCloseSearch();
    toast.success(
      language === "zh"
        ? `已匹配: ${movie.title}`
        : `Matched: ${movie.title}`
    );
  };

  const newResults = resolvedMovies.filter(
    (m) => !selectedMovieIds.has(m.id)
  );
  const addedCount = resolvedMovies.length - newResults.length;
  const newCount = newResults.length;

  const showDropzone = parsedCount === 0 && !parsing;
  const showPreResolve = parsedCount > 0 && resolvedMovies.length === 0;

  return (
    <div className="space-y-4">
      {showDropzone && (
        <>
          <p className="text-sm text-muted-foreground">{t.setup.csvSubtitle}</p>

          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
            <Info className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.setup.csvHowTo}
            </p>
          </div>
        </>
      )}

      {showDropzone && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-12 cursor-pointer transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t.setup.csvDropzone}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {parsedCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {language === "zh"
                ? `从 ${source} 解析了 ${parsedCount} 条记录`
                : `Parsed ${parsedCount} entries from ${source}`}
            </span>
            <Button size="sm" onClick={handleReset}>
              <Upload className="size-3.5" />
              {language === "zh" ? "重新上传" : "Re-upload"}
            </Button>
          </div>

          {showPreResolve && ratingCount === 0 && (
            <Button
              onClick={handleStartResolve}
              disabled={resolving}
              className="w-full"
            >
              {resolving ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : null}
              {t.setup.csvStartResolve} (
              {t.setup.csvEntriesAfterFilter.replace(
                "{count}",
                String(parsedCount)
              )}
              )
            </Button>
          )}

          {showPreResolve && ratingCount > 0 && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="size-4 text-muted-foreground" />
                <span className="font-medium">
                  {t.setup.csvRatingFilter}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.setup.csvRatingCount.replace(
                    "{count}",
                    String(ratingCount)
                  )}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {t.setup.minRating}
                  </Label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {minRating != null ? minRating : t.setup.csvNoFilter}
                  </span>
                </div>
                <Slider
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={[minRating ?? sliderMin]}
                  onValueChange={(v) =>
                    setMinRating(v[0] <= sliderMin ? null : v[0])
                  }
                />
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
          )}

          {resolving && progress && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {language === "zh"
                    ? `正在匹配电影... ${progress.resolved}/${progress.total}`
                    : `Resolving films... ${progress.resolved}/${progress.total}`}
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
                                  language === "zh" ? "搜索电影..." : "Search for a film..."
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
                                {language === "zh" ? "搜索中..." : "Searching..."}
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

                            {!searching && searchQuery && searchResults.length === 0 && (
                              <p className="py-2 text-xs text-muted-foreground">
                                {language === "zh"
                                  ? "无结果"
                                  : "No results"}
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
        </div>
      )}
    </div>
  );
}