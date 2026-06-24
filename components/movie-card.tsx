"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import type { Movie } from "@/types";
import { cn } from "@/lib/utils";
import {
  buildTmdbImageUrl,
  reportImageFailure,
  reportImageSuccess,
  shouldUseTmdbProxy,
  subscribeToProxyStatus,
} from "@/lib/tmdb-image-fallback";

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showOverview?: boolean;
}

const sizeClasses = {
  sm: { poster: "w-24 h-36", title: "text-sm" },
  md: { poster: "w-32 h-48", title: "text-base" },
  lg: { poster: "w-full aspect-[2/3]", title: "text-lg" },
};

export function MovieCard({
  movie,
  onClick,
  className,
  size = "md",
  showOverview = false,
}: MovieCardProps) {
  const classes = sizeClasses[size];
  const [useLocalProxy, setUseLocalProxy] = useState(false);
  const [globalProxyEnabled, setGlobalProxyEnabled] = useState(shouldUseTmdbProxy());

  useEffect(() => {
    const unsubscribe = subscribeToProxyStatus(() => {
      setGlobalProxyEnabled(shouldUseTmdbProxy());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const useProxy = globalProxyEnabled || useLocalProxy;
  const imageUrl = movie.posterPath
    ? buildTmdbImageUrl(movie.posterPath, "w500", useProxy)
    : "";

  const handleError = () => {
    if (!useLocalProxy) {
      setUseLocalProxy(true);
      reportImageFailure();
    }
  };

  const handleLoad = () => {
    if (!useProxy && movie.posterPath) {
      reportImageSuccess();
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-2",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted shadow-sm transition-all",
          classes.poster,
          onClick && "group-hover:scale-[1.02] group-hover:shadow-md"
        )}
      >
        {movie.posterPath ? (
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
            onError={handleError}
            onLoad={handleLoad}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs p-2 text-center">
            {movie.title}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className={cn("font-medium leading-tight line-clamp-2", classes.title)}>
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {movie.year > 0 && <span>{movie.year}</span>}
          {movie.voteAverage > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="size-3 fill-current" />
              {movie.voteAverage.toFixed(1)}
            </span>
          )}
        </div>
        {showOverview && movie.overview && (
          <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
}
