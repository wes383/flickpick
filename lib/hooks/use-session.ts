"use client";

import { useState, useEffect, useCallback } from "react";
import type { Movie, RankingSession } from "@/types";
import {
  getSession,
  saveSession,
  createSession,
  addMoviesToSession,
  removeMovieFromSession,
  clearSession,
} from "@/lib/storage";

export function useSession() {
  const [session, setSession] = useState<RankingSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = getSession();
    if (existing) {
      setSession(existing);
    } else {
      setSession(createSession());
    }
    setMounted(true);
  }, []);

  const update = useCallback((newSession: RankingSession) => {
    setSession(newSession);
    saveSession(newSession);
  }, []);

  const addMovies = useCallback(
    (movies: Movie[]) => {
      setSession((prev) => {
        if (!prev) return prev;
        const updated = addMoviesToSession(prev, movies);
        saveSession(updated);
        return updated;
      });
    },
    []
  );

  const removeMovie = useCallback((movieId: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = removeMovieFromSession(prev, movieId);
      saveSession(updated);
      return updated;
    });
  }, []);

  const replaceSession = useCallback(
    (newSession: RankingSession) => {
      update(newSession);
    },
    [update]
  );

  const reset = useCallback(() => {
    clearSession();
    setSession(createSession());
  }, []);

  return {
    session,
    mounted,
    addMovies,
    removeMovie,
    replaceSession,
    reset,
    update,
  };
}
