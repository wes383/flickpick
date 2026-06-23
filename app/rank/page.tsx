"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Undo, ArrowRight, Film, Trophy } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { MovieComparison } from "@/components/movie-comparison";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "@/lib/hooks/use-session";
import {
  initTournament,
  getNextPair,
  applyResult,
  cloneState,
  isComplete,
  getProgress,
} from "@/lib/tournament";
import type { Comparison } from "@/types";
import { TOP_N } from "@/types";

export default function RankPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, mounted, update } = useSession();
  const [currentPair, setCurrentPair] = useState<[number, number] | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickedSide, setPickedSide] = useState<"left" | "right" | null>(null);
  const pairSetByPickRef = useRef(false);

  const movies = session?.movies || [];
  const tournament = session?.tournament || null;
  const comparisons = session?.comparisons || [];

  const progress = useMemo(() => {
    return getProgress(tournament, movies.length);
  }, [tournament, movies.length]);

  const completed = useMemo(() => {
    return isComplete(tournament);
  }, [tournament]);

  const topKCount = useMemo(() => {
    return tournament?.topK.length || 0;
  }, [tournament]);

  useEffect(() => {
    if (!session || movies.length < 2 || picking) return;
    if (pairSetByPickRef.current) {
      pairSetByPickRef.current = false;
      return;
    }

    let state = tournament;
    if (!state) {
      state = initTournament(movies.map((m) => m.id));
      const updatedSession = {
        ...session,
        tournament: state,
      };
      update(updatedSession);
    }

    const pair = getNextPair(state);
    setCurrentPair(pair);
  }, [session, movies.length, tournament, picking, update]);

  const handlePick = useCallback(
    (winnerId: number) => {
      if (!currentPair || !session || !session.tournament || picking) return;
      setPicking(true);
      setPickedSide(winnerId === currentPair[0] ? "left" : "right");

      const [aId, bId] = currentPair;

      const snapshot = cloneState(session.tournament);

      const state = cloneState(session.tournament);
      applyResult(state, winnerId);

      const nextPair = getNextPair(state);

      const comparison: Comparison = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        movieAId: aId,
        movieBId: bId,
        winnerId,
        timestamp: Date.now(),
      };

      const updatedSession = {
        ...session,
        tournament: state,
        comparisons: [...comparisons, comparison],
        history: [...session.history, snapshot].slice(-50),
      };

      update(updatedSession);

      setTimeout(() => {
        setCurrentPair(nextPair);
        pairSetByPickRef.current = true;
        setPicking(false);
        setPickedSide(null);
      }, 500);
    },
    [currentPair, session, picking, comparisons, update]
  );

  const handleUndo = useCallback(() => {
    if (!session || session.history.length === 0) return;

    const prevTournament = session.history[session.history.length - 1];
    const updatedSession = {
      ...session,
      tournament: prevTournament,
      comparisons: comparisons.slice(0, -1),
      history: session.history.slice(0, -1),
    };

    update(updatedSession);

    const state = cloneState(prevTournament);
    const pair = getNextPair(state);
    setCurrentPair(pair);
  }, [session, comparisons, update]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (picking || !currentPair) return;
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePick(currentPair[0]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handlePick(currentPair[1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentPair, picking, handlePick]);

  if (!mounted) return null;

  if (movies.length < 2) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <Film className="size-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{t.rank.empty}</p>
            <Button onClick={() => router.push("/setup")}>
              {t.rank.goSetup}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-6">
            <Trophy className="size-16 text-yellow-500 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-2xl font-medium tracking-tight">
                {t.rank.complete}
              </h1>
              <p className="text-muted-foreground">
                {t.rank.completeDesc.replace("{count}", String(comparisons.length))}
              </p>
            </div>
            <Button size="lg" onClick={() => router.push("/results")}>
              {t.rank.viewResults}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const movieA = movies.find((m) => m.id === currentPair?.[0]);
  const movieB = movies.find((m) => m.id === currentPair?.[1]);
  const pairKey = currentPair ? currentPair.join("-") : null;
  const progressPct = Math.round(progress * 100);
  const canViewResults = topKCount >= TOP_N || (topKCount > 0 && completed);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />

      <div className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-medium">
                {t.rank.progress.replace("{current}", String(comparisons.length + 1))}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {t.rank.progressLabel}
                </span>
                <div className="h-2 w-full max-w-48 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${Math.min(100, progressPct)}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {progressPct}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={comparisons.length === 0 || picking}
              >
                <Undo className="size-4" />
                {t.rank.undo}
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/results")}
                disabled={!canViewResults}
              >
                {t.rank.viewResults}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 py-4 text-center">
          <h1 className="text-xl md:text-2xl font-medium tracking-tight">
            {t.rank.title}
          </h1>
        </div>

        {movieA && movieB && pairKey ? (
          <MovieComparison
            key={pairKey}
            movieA={movieA}
            movieB={movieB}
            onPick={handlePick}
            disabled={picking}
            pickedSide={pickedSide}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{t.common.loading}</p>
          </div>
        )}
      </div>
    </div>
  );
}
