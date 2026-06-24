"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X, ChevronRight, Trash2, RotateCcw, ListFilter } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SeedListSelector } from "@/components/seed-list-selector";
import { TmdbFilterForm } from "@/components/tmdb-filter-form";
import { CsvImporter } from "@/components/csv-importer";
import { MovieSearch } from "@/components/movie-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TmdbImage } from "@/components/tmdb-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SetupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, mounted, addMovies, removeMovie, reset } = useSession();
  const [selectedExpanded, setSelectedExpanded] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const isRankingActive = session?.tournament !== null && session?.tournament !== undefined;

  const selectedMovieIds = useMemo(
    () => new Set((session?.movies || []).map((m) => m.id)),
    [session?.movies]
  );

  const movieCount = session?.movies.length || 0;

  const handleStart = () => {
    if (movieCount < 2) return;
    router.push("/rank");
  };

  useEffect(() => {
    if (!mounted) return;
    const bodyOrig = document.body.style.overflow;
    const htmlOrig = document.documentElement.style.overflow;
    if (selectedExpanded) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = bodyOrig;
      document.documentElement.style.overflow = htmlOrig;
    }
    return () => {
      document.body.style.overflow = bodyOrig;
      document.documentElement.style.overflow = htmlOrig;
    };
  }, [selectedExpanded, mounted]);

  useEffect(() => {
    if (movieCount === 0 && selectedExpanded) {
      setSelectedExpanded(false);
    }
  }, [movieCount, selectedExpanded]);

  const handleClear = () => {
    reset();
    setClearDialogOpen(false);
    setSelectedExpanded(false);
    toast.success(t.setup.cleared);
  };

  const handleResetRanking = () => {
    reset();
    setResetDialogOpen(false);
    toast.success(t.setup.activeResetDone);
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12 pb-32">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
              {t.setup.title}
            </h1>
            <p className="text-muted-foreground">{t.setup.subtitle}</p>
          </div>
        </main>
      </div>
    );
  }

  // Ranking in progress — show centered empty state like rank/results pages
  if (isRankingActive) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <ListFilter className="size-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t.setup.activeDesc}</p>
            <p className="text-sm text-muted-foreground">
              {t.setup.activeFilms
                .replace("{count}", String(movieCount))
                .replace("{comparisons}", String(session?.comparisons.length || 0))}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => router.push("/rank")}>
                {t.setup.activeResume}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="destructive"
                onClick={() => setResetDialogOpen(true)}
              >
                <RotateCcw className="size-4" />
                {t.setup.activeReset}
              </Button>
            </div>
          </div>
        </main>

        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.setup.activeResetConfirm}</DialogTitle>
              <DialogDescription>
                {t.setup.activeResetDesc}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setResetDialogOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button variant="destructive" onClick={handleResetRanking}>
                <RotateCcw className="size-4" />
                {t.setup.activeReset}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Normal seed list setup
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-12 pb-32">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            {t.setup.title}
          </h1>
          <p className="text-muted-foreground">{t.setup.subtitle}</p>
        </div>

        <Tabs defaultValue="preset" className="space-y-8">
          <TabsList variant="slider" className="flex w-full h-auto p-1.5 bg-muted/60">
            <TabsTrigger
              value="preset"
              className="flex-1 px-4 py-2 text-sm font-medium"
            >
              {t.setup.tabPreset}
            </TabsTrigger>
            <TabsTrigger
              value="tmdb"
              className="flex-1 px-4 py-2 text-sm font-medium"
            >
              {t.setup.tabTmdb}
            </TabsTrigger>
            <TabsTrigger
              value="csv"
              className="flex-1 px-4 py-2 text-sm font-medium"
            >
              {t.setup.tabCsv}
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="flex-1 px-4 py-2 text-sm font-medium"
            >
              {t.setup.tabSearch}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preset" forceMount>
            <SeedListSelector
              onAddMovies={addMovies}
              selectedMovieIds={selectedMovieIds}
            />
          </TabsContent>

          <TabsContent value="tmdb" forceMount>
            <TmdbFilterForm
              onAddMovies={addMovies}
              selectedMovieIds={selectedMovieIds}
            />
          </TabsContent>

          <TabsContent value="csv" forceMount>
            <CsvImporter
              onAddMovies={addMovies}
              selectedMovieIds={selectedMovieIds}
            />
          </TabsContent>

          <TabsContent value="search" forceMount>
            <MovieSearch
              onAddMovies={addMovies}
              selectedMovieIds={selectedMovieIds}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom bar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/40 transition-opacity duration-300",
          selectedExpanded && movieCount > 0
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSelectedExpanded(false)}
        aria-hidden="true"
      />

      {/* Bottom bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-md transition-[max-height] duration-300 ease-in-out overflow-hidden",
          selectedExpanded ? "max-h-[80vh]" : "max-h-24"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => movieCount > 0 && setSelectedExpanded((prev) => !prev)}
            disabled={movieCount === 0}
            className={cn(
              "flex items-center gap-2 text-left",
              movieCount > 0 ? "cursor-pointer" : "cursor-default"
            )}
          >
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                selectedExpanded && "rotate-90",
                movieCount === 0 && "opacity-40"
              )}
            />
            <span className="text-base font-semibold tabular-nums">
              {movieCount}
            </span>
            <span className="text-sm text-muted-foreground">
              {t.setup.movies}
            </span>
            {movieCount < 2 && movieCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {t.setup.empty}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setClearDialogOpen(true)}
              disabled={movieCount === 0}
              aria-label={t.setup.clearAll}
              title={t.setup.clearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              onClick={handleStart}
              disabled={movieCount < 2}
              size="default"
            >
              {t.setup.startRanking}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.setup.clearAllConfirm}</DialogTitle>
              <DialogDescription>
                {t.setup.clearAllDescription}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setClearDialogOpen(false)}
              >
                {t.common.cancel}
              </Button>
              <Button variant="destructive" onClick={handleClear}>
                <Trash2 className="size-4" />
                {t.setup.clearAll}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedExpanded && movieCount > 0 && (
          <div className="border-t border-border/50 max-h-[calc(80vh-4rem)] py-4">
            <div className="mx-auto max-w-6xl max-h-[calc(80vh-4rem-2rem)] overflow-y-auto scrollbar-thin px-6">
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-8">
                {session?.movies.map((movie) => (
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
                        onClick={() => removeMovie(movie.id)}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover/poster:opacity-100 max-sm:opacity-100 hover:bg-background"
                        aria-label="Remove"
                      >
                        <X className="size-3" />
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
