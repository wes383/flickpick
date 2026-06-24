"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownUp, ArrowUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteTop100 } from "@/components/site-top100";
import { PublicListCard } from "@/components/public-list-card";
import { useI18n } from "@/lib/i18n/context";
import { toTmdbLanguage } from "@/lib/i18n/dictionaries";
import { getFingerprint } from "@/lib/fingerprint";
import {
  deletePublicList,
  fetchMoviesBatch,
  fetchPublicLists,
} from "@/lib/public-api";
import type { Movie, PublicList } from "@/types";

export default function CommunityPage() {
  const { t, language } = useI18n();
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [sort, setSort] = useState<"recent" | "likes">("recent");
  const [lists, setLists] = useState<PublicList[]>([]);
  const [movieMap, setMovieMap] = useState<Record<number, Movie>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ownListId, setOwnListId] = useState<string | null>(null);
  const [ownList, setOwnList] = useState<PublicList | null>(null);
  const [tab, setTab] = useState("allLists");

  useEffect(() => {
    getFingerprint().then(setFingerprint).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fingerprint) return;
    let cancelled = false;
    fetch(`/api/public/check?fingerprint=${encodeURIComponent(fingerprint)}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (cancelled) return;
        if (data.exists && data.list) {
          setOwnList(data.list);
          setOwnListId(data.list.id);
          if (data.list.tmdbIds && data.list.tmdbIds.length > 0) {
            const langCode = toTmdbLanguage(language);
            try {
              const movies = await fetchMoviesBatch(data.list.tmdbIds, langCode);
              setMovieMap((prev) => ({ ...prev, ...movies }));
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          setOwnList(null);
          setOwnListId(null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fingerprint, language]);

  const mergeMovies = useCallback(
    async (newLists: PublicList[]) => {
      const knownIds = new Set(Object.keys(movieMap).map(Number));
      const missing = Array.from(
        new Set(newLists.flatMap((l) => l.tmdbIds))
      ).filter((id) => !knownIds.has(id));
      if (missing.length === 0) return;
      const langCode = toTmdbLanguage(language);
      const BATCH_SIZE = 50;
      const merged: Record<number, Movie> = {};
      for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const slice = missing.slice(i, i + BATCH_SIZE);
        const movies = await fetchMoviesBatch(slice, langCode);
        Object.assign(merged, movies);
      }
      setMovieMap((prev) => ({ ...prev, ...merged }));
    },
    [movieMap, language]
  );

  const loadFirst = useCallback(
    async (sortMode: "recent" | "likes", fp: string) => {
      setLoading(true);
      try {
        const { items, hasMore: more } = await fetchPublicLists(
          sortMode,
          1,
          fp
        );
        setLists(items);
        setHasMore(more);
        setPage(1);
        await mergeMovies(items);
      } catch {
        toast.error(t.common.error);
      } finally {
        setLoading(false);
      }
    },
    [mergeMovies, t]
  );

  // Load lists when tab switches to allLists, or when sort/fingerprint changes
  useEffect(() => {
    if (tab === "allLists" && fingerprint) {
      loadFirst(sort, fingerprint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, fingerprint, sort]);

  const handleLoadMore = async () => {
    if (!fingerprint || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { items, hasMore: more } = await fetchPublicLists(
        sort,
        nextPage,
        fingerprint
      );
      setLists((prev) => [...prev, ...items]);
      setHasMore(more);
      setPage(nextPage);
      await mergeMovies(items);
    } catch {
      toast.error(t.common.error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteOwn = async () => {
    if (!fingerprint) return;
    try {
      await deletePublicList(fingerprint);
      setOwnListId(null);
      setOwnList(null);
      setLists((prev) => prev.filter((l) => l.fingerprint !== fingerprint));
      toast.success(t.community.deleted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    }
  };

  const displayedLists = (() => {
    const filtered = lists.filter((l) => l.fingerprint !== fingerprint);
    if (ownList) {
      const latestOwn = lists.find((l) => l.fingerprint === fingerprint) || ownList;
      return [latestOwn, ...filtered];
    }
    return filtered;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-12 pb-32">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
              {t.community.title}
            </h1>
            <p className="text-muted-foreground">{t.community.subtitle}</p>
          </div>
        </div>

        <Tabs
          defaultValue="allLists"
          onValueChange={setTab}
          className="space-y-8"
        >
          <TabsList variant="slider" className="flex w-full h-auto p-1.5 bg-muted/60">
            <TabsTrigger value="allLists" className="flex-1 px-4 py-2 text-sm font-medium">
              {t.community.tabAllLists}
            </TabsTrigger>
            <TabsTrigger value="siteTop" className="flex-1 px-4 py-2 text-sm font-medium">
              {t.community.tabSiteTop}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allLists" forceMount>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {t.community.allListsTitle}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSort((s) => (s === "recent" ? "likes" : "recent"))}
                >
                  {sort === "recent" ? (
                    <ArrowDownUp className="size-3.5" />
                  ) : (
                    <ArrowUpDown className="size-3.5" />
                  )}
                  {sort === "recent" ? t.community.sortRecent : t.community.sortLikes}
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : displayedLists.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {t.community.empty}
                </p>
              ) : (
                <div className="space-y-3">
                  {displayedLists.map((list) => (
                    <PublicListCard
                      key={list.id}
                      list={list}
                      currentFingerprint={fingerprint || ""}
                      movieMap={movieMap}
                      onDeleteOwn={handleDeleteOwn}
                    />
                  ))}
                  {hasMore && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        {t.community.loadMore}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="siteTop" forceMount>
            <SiteTop100 />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
