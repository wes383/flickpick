"use client";

import { useI18n } from "@/lib/i18n/context";
import type { Movie } from "@/types";
import { cn } from "@/lib/utils";

interface MovieComparisonProps {
  movieA: Movie;
  movieB: Movie;
  onPick: (winnerId: number) => void;
  disabled?: boolean;
  pickedSide?: "left" | "right" | null;
}

export function MovieComparison({
  movieA,
  movieB,
  onPick,
  disabled,
  pickedSide,
}: MovieComparisonProps) {
  const { t } = useI18n();
  const isTransitioning = disabled && pickedSide !== null;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="grid flex-1 min-h-0 grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 relative">
        <ComparisonCard
          movie={movieA}
          side="left"
          state={pickedSide === "left" ? "picked" : pickedSide === "right" ? "loser" : "idle"}
          onPick={() => onPick(movieA.id)}
          disabled={disabled}
        />
        <ComparisonCard
          movie={movieB}
          side="right"
          state={pickedSide === "right" ? "picked" : pickedSide === "left" ? "loser" : "idle"}
          onPick={() => onPick(movieB.id)}
          disabled={disabled}
        />

        {isTransitioning && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-10",
              "flex items-center justify-center",
              "animate-fade-in"
            )}
            aria-hidden
          >
            <div
              className={cn(
                "absolute inset-0 bg-background/40 backdrop-blur-[2px]",
                "animate-fade-in"
              )}
            />
            <div
              className={cn(
                "relative flex flex-col items-center gap-3",
                "animate-scale-in"
              )}
            >
              <div className="relative size-12">
                <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                <span className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary/60 animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
              </div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {t.rank.loading}
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="hidden sm:block shrink-0 py-3 text-center text-xs text-muted-foreground">
        {t.rank.keyboardHint}
      </p>
    </div>
  );
}

type CardState = "idle" | "picked" | "loser";

function ComparisonCard({
  movie,
  side,
  state,
  onPick,
  disabled,
}: {
  movie: Movie;
  side: "left" | "right";
  state: CardState;
  onPick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-6 p-6 md:p-8 max-sm:flex-row max-sm:items-center max-sm:justify-start max-sm:gap-4 max-sm:p-4",
        "h-full min-h-0",
        "transition-all duration-500 ease-out",
        "hover:bg-secondary/50",
        "md:border-r border-border/50 last:border-r-0",
        disabled && "pointer-events-none",
        state === "picked" && "scale-[1.02]",
        state === "loser" && "scale-[0.97] opacity-30 saturate-50",
        "animate-pair-in"
      )}
    >
      {state === "picked" && (
        <span
          className={cn(
            "pointer-events-none absolute inset-3 rounded-2xl",
            "ring-2 ring-primary/70",
            "shadow-[0_0_40px_-5px] shadow-primary/30"
          )}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "relative aspect-[2/3] h-full max-h-[70vh] max-sm:h-40 max-sm:max-h-40 max-sm:flex-shrink-0 w-auto max-w-full overflow-hidden rounded-xl shadow-sm",
          "transition-transform duration-500 ease-out",
          "group-hover:scale-[1.02]",
          state === "picked" && "shadow-lg shadow-primary/20"
        )}
      >
        {movie.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt={movie.title}
            className="h-full w-auto max-w-full object-contain"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="flex h-full min-h-72 max-sm:min-h-40 w-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
            {movie.title}
          </div>
        )}
      </div>

      <div className="shrink-0 text-center max-sm:text-left max-sm:flex-1 max-sm:min-w-0">
        <h2 className="text-xl md:text-2xl font-medium tracking-tight">
          {movie.title}
        </h2>
        {movie.year > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">{movie.year}</p>
        )}
      </div>
    </button>
  );
}
