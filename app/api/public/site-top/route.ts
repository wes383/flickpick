import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import type { SiteTopItem } from "@/types";

// 进程内 in-flight 锁：60s 缓存到期瞬间，避免多个请求同时打到 DB
let inflight: Promise<SiteTopItem[]> | null = null;
let inflightAt = 0;
const INFLIGHT_TTL_MS = 5_000;

// 进程内短期记忆：DB 结果再额外缓存一小段时间，降低冷启后的 DB 压力
let memo: { at: number; data: SiteTopItem[] } | null = null;
const MEMO_TTL_MS = 30_000;

async function computeTop10(): Promise<SiteTopItem[]> {
  const supabase = getSupabaseServer();
  // 由 Postgres 聚合下推：传输量从"整张 public_lists"降到"10 行"
  const { data, error } = await supabase.rpc("get_site_top10");
  if (error) throw error;
  return ((data ?? []) as Array<{
    tmdb_id: number;
    score: number;
    appearance_count: number | string;
  }>).map((r) => ({
    tmdbId: r.tmdb_id,
    score: Number(r.score),
    appearanceCount: Number(r.appearance_count),
  }));
}

async function getTop10(): Promise<SiteTopItem[]> {
  const now = Date.now();

  if (memo && now - memo.at < MEMO_TTL_MS) {
    return memo.data;
  }

  if (inflight && now - inflightAt < INFLIGHT_TTL_MS) {
    return inflight;
  }

  inflight = computeTop10()
    .then((data) => {
      memo = { at: Date.now(), data };
      return data;
    })
    .finally(() => {
      inflight = null;
      inflightAt = Date.now();
    });

  return inflight;
}

export async function GET() {
  try {
    const items = await getTop10();
    return NextResponse.json(
      { items },
      {
        headers: {
          // 边缘缓存 5 分钟，本地 1 分钟；过期的同时后台刷新
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
