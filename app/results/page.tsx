"use client";

import { useMemo, useState, useRef, useCallback, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trophy, ChevronDown, Share2, Loader2, Upload } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/upload-dialog";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "@/lib/hooks/use-session";
import { cn } from "@/lib/utils";
import { isComplete } from "@/lib/tournament";
import { TOP_N } from "@/types";
import type { Movie } from "@/types";

interface ShareCardProps {
  movies: Movie[];
  title: string;
  subtitle: string;
  brand: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ movies, title, subtitle, brand }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 800,
          background: "#ffffff",
          padding: "48px 48px 40px",
          fontFamily: "Inter, Noto Sans SC, system-ui, sans-serif",
          color: "#18181b",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "#18181b",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#71717a",
              marginTop: 8,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Movie list */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px 32px",
          }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 300,
                  color: "#d4d4d8",
                  width: 36,
                  textAlign: "center",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>

              {/* Poster */}
              <div
                style={{
                  width: 56,
                  height: 84,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#f4f4f5",
                  flexShrink: 0,
                }}
              >
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                    alt={movie.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 4,
                      fontSize: 9,
                      textAlign: "center",
                      color: "#a1a1aa",
                    }}
                  >
                    {movie.title}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.3,
                    color: "#18181b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {movie.title}
                </p>
                {movie.year > 0 && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#a1a1aa",
                      margin: "2px 0 0",
                    }}
                  >
                    {movie.year}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid #e4e4e7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: "#18181b" }}>
            {brand}
          </span>
          <span style={{ fontSize: 13, color: "#a1a1aa" }}>
            flickpick.wesluma.com
          </span>
        </div>
      </div>
    );
  }
);

export default function ResultsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, mounted, reset } = useSession();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const topMovies = useMemo(() => {
    if (!session || !session.tournament) return [];

    const topK = session.tournament.topK;
    return topK
      .map((movieId) => session.movies.find((m) => m.id === movieId))
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [session]);

  const canViewResults = useMemo(() => {
    if (!session || !session.tournament) return false;
    return isComplete(session.tournament) || session.tournament.topK.length >= TOP_N;
  }, [session]);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "flickpick-top10.png";
      link.href = dataUrl;
      link.click();
      toast.success("Saved");
    } catch {
      toast.error("Failed to generate image");
    } finally {
      setSharing(false);
    }
  }, [sharing]);

  if (!mounted) return null;

  if (!session || session.comparisons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <Trophy className="size-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t.results.empty}</p>
            <Button onClick={() => router.push("/rank")}>
              {t.results.goRank}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!canViewResults) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <Trophy className="size-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t.results.notReady}</p>
            <Button onClick={() => router.push("/rank")}>
              {t.results.goRank}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleRestart = () => {
    reset();
    router.push("/setup");
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            {t.results.title}
          </h1>
          <p className="text-muted-foreground">
            {t.results.subtitle
              .replace("{count}", String(session.comparisons.length))
              .replace("{films}", String(session.movies.length))}
          </p>
        </div>

        <div className="space-y-3">
          {topMovies.map((movie, index) => (
            <div key={movie.id}>
              <button
                onClick={() => movie.overview && toggleExpand(movie.id)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-xl border border-border/50 p-4 text-left transition-colors hover:bg-secondary/30",
                  expandedId === movie.id && "bg-secondary/20"
                )}
              >
                <div className="relative flex w-12 flex-shrink-0 justify-center md:w-16">
                  <span className="text-5xl md:text-7xl font-light text-muted-foreground/30 tabular-nums">
                    {index + 1}
                  </span>
                </div>

                <a
                  href={`https://kino.wesluma.com/movie/${movie.tmdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm md:h-36 md:w-24"
                  onClick={(e) => e.stopPropagation()}
                >
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                      {movie.title}
                    </div>
                  )}
                </a>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-lg font-medium leading-tight line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.year > 0 && <span>{movie.year}</span>}
                  </p>
                </div>

                {movie.overview && (
                  <ChevronDown
                    className={cn(
                      "size-5 flex-shrink-0 text-muted-foreground transition-transform",
                      expandedId === movie.id && "rotate-180"
                    )}
                  />
                )}
              </button>

              {expandedId === movie.id && movie.overview && (
                <div className="mx-4 mb-1 rounded-b-xl border border-t-0 border-border/50 bg-muted/20 px-4 py-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Share2 className="size-4" />
            )}
            {sharing ? t.results.shareGenerating : t.results.share}
          </Button>
          <Button variant="outline" size="lg" onClick={handleRestart}>
            <RotateCcw className="size-4" />
            {t.results.restart}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setUploadOpen(true)}
            disabled={topMovies.length < TOP_N}
          >
            <Upload className="size-4" />
            {t.results.uploadToPublic}
          </Button>
        </div>
      </main>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tmdbIds={topMovies.slice(0, TOP_N).map((m) => m.tmdbId)}
      />

      <div
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <ShareCard
          ref={shareCardRef}
          movies={topMovies}
          title={t.results.shareCardTitle}
          subtitle={t.results.shareCardSubtitle
            .replace("{count}", String(session.comparisons.length))
            .replace("{films}", String(session.movies.length))}
          brand={t.brand}
        />
      </div>
    </div>
  );
}
