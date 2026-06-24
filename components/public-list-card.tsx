"use client";

import { useState } from "react";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";
import { likePublicList, unlikePublicList } from "@/lib/public-api";
import type { Movie, PublicList } from "@/types";
import { TmdbImage } from "@/components/tmdb-image";

interface PublicListCardProps {
  list: PublicList;
  currentFingerprint: string;
  movieMap: Record<number, Movie>;
  onDeleteOwn?: () => void;
}

export function PublicListCard({
  list,
  currentFingerprint,
  movieMap,
  onDeleteOwn,
}: PublicListCardProps) {
  const { t } = useI18n();
  const [liked, setLiked] = useState(list.likedByMe);
  const [likeCount, setLikeCount] = useState(list.likeCount);
  const [toggling, setToggling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOwn = list.fingerprint === currentFingerprint;

  const handleToggleLike = async () => {
    if (toggling) return;
    const wasLiked = liked;
    setToggling(true);
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        const res = await unlikePublicList(list.id, currentFingerprint);
        setLiked(res.liked);
        setLikeCount(res.likeCount);
      } else {
        const res = await likePublicList(list.id, currentFingerprint);
        setLiked(res.liked);
        setLikeCount(res.likeCount);
      }
    } catch (err) {
      setLiked(wasLiked);
      setLikeCount(list.likeCount);
      toast.error(err instanceof Error ? err.message : t.common.error);
    } finally {
      setToggling(false);
    }
  };

  const created = new Date(list.createdAt);

  return (
    <>
    <div className="rounded-xl border border-border/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium truncate">{list.username}</p>
          <p className="text-xs text-muted-foreground">
            {created.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        {!isOwn && (
          <Button
            variant={liked ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleLike}
            disabled={toggling}
            className="gap-1.5"
          >
            {toggling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart
                className={cn("size-4", liked && "fill-current text-red-500")}
              />
            )}
            {likeCount}
          </Button>
        )}
        {isOwn && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {t.community.yours}
            </span>
            {onDeleteOwn && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => setConfirmOpen(true)}
                className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-destructive/20 transition-colors"
              >
                <Trash2 className="size-3.5" />
                {t.community.deleteMine}
              </Button>
            )}
            <div className="inline-flex h-7 items-center gap-1.5 rounded-[min(var(--radius-md),12px)] border border-border bg-muted/40 px-2.5 text-[0.8rem] font-medium text-muted-foreground select-none">
              <Heart className="size-4 fill-current text-red-500" />
              <span>{likeCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {list.tmdbIds.map((tmdbId, index) => {
          const movie = movieMap[tmdbId];
          return (
            <div key={`${tmdbId}-${index}`} className="space-y-1">
              <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted">
                {movie ? (
                  movie.posterPath ? (
                    <TmdbImage
                      path={movie.posterPath}
                      size="w200"
                      alt={movie.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-1 text-center text-[8px] text-muted-foreground">
                      {movie.title}
                    </div>
                  )
                ) : (
                  <Skeleton className="h-full w-full" />
                )}
                <span className="absolute top-0.5 left-0.5 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                  {index + 1}
                </span>
              </div>
              <p className="text-[10px] leading-tight line-clamp-2 text-muted-foreground">
                {movie?.title ?? ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>

    {onDeleteOwn && (
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t.community.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>{t.community.deleteConfirmDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDeleteOwn();
              }}
            >
              <Trash2 className="size-4" />
              {t.community.deleteConfirmButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </>
  );
}
