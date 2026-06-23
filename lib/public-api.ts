import type { Movie, PublicList, SiteTopItem } from "@/types";

export interface UploadPayload {
  fingerprint: string;
  username: string;
  tmdbIds: number[];
  turnstileToken: string;
}

export async function uploadPublicList(
  payload: UploadPayload
): Promise<{ id: string }> {
  const res = await fetch("/api/public/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }
  return res.json();
}

export async function deletePublicList(fingerprint: string): Promise<void> {
  const res = await fetch("/api/public/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fingerprint }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Delete failed");
  }
}

export async function fetchPublicLists(
  sort: "recent" | "likes",
  page: number,
  likerFingerprint: string
): Promise<{ items: PublicList[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    sort,
    page: String(page),
    likerFingerprint,
  });
  const res = await fetch(`/api/public/lists?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch lists");
  return res.json();
}

export async function likePublicList(
  listId: string,
  likerFingerprint: string
): Promise<{ liked: boolean; likeCount: number }> {
  const res = await fetch("/api/public/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listId, likerFingerprint }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Like failed");
  }
  return res.json();
}

export async function unlikePublicList(
  listId: string,
  likerFingerprint: string
): Promise<{ liked: boolean; likeCount: number }> {
  const res = await fetch("/api/public/like", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listId, likerFingerprint }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Unlike failed");
  }
  return res.json();
}

export async function fetchSiteTop10(): Promise<SiteTopItem[]> {
  const res = await fetch("/api/public/site-top");
  if (!res.ok) throw new Error("Failed to fetch site top");
  const data = await res.json();
  return data.items;
}

export async function fetchMoviesBatch(
  ids: number[],
  lang: string
): Promise<Record<number, Movie>> {
  if (ids.length === 0) return {};
  const params = new URLSearchParams({
    ids: ids.join(","),
    lang,
  });
  const res = await fetch(`/api/tmdb/batch?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}
