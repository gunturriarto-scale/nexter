import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300;

const SCRAPECREATORS_BASE = "https://api.scrapecreators.com";

function apiKey() {
  const k = process.env.SCRAPECREATORS_API_KEY;
  if (!k) throw new Error("SCRAPECREATORS_API_KEY not set");
  return k;
}

interface ScVideo {
  statistics?: {
    playCount?: number;
    diggCount?: number;
    commentCount?: number;
    shareCount?: number;
  };
  desc?: string;
}

/**
 * Pull latest engagement for a tracked post URL via ScrapeCreators /v2/tiktok/video.
 * Uses cache_max_age=1d so repeated syncs within a day cost 0 credits.
 */
async function fetchVideo(url: string): Promise<ScVideo | null> {
  const params = new URLSearchParams({ url, cache_max_age: "1d", trim: "true" });
  const res = await fetch(`${SCRAPECREATORS_BASE}/v2/tiktok/video?${params}`, {
    headers: { "x-api-key": apiKey() },
    cache: "no-store",
  });
  if (res.status === 404) return null; // not found
  if (res.status === 401 || res.status === 402) {
    throw new Error(`ScrapeCreators auth/credit error: ${res.status}`);
  }
  const json = await res.json();
  if (!json.success && json.code !== 200) return null;
  return (json.data ?? json) as ScVideo;
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.SYNC_TRIGGER_SECRET;
  if (configuredSecret) {
    const header = req.headers.get("authorization");
    if (header !== `Bearer ${configuredSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();
  const { data: posts, error } = await supabase
    .from("kol_tracked_posts")
    .select("post_id, post_url, sync_status");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let synced = 0;
  let notFound = 0;
  let failed = 0;
  const results: Record<string, unknown>[] = [];

  for (const post of posts ?? []) {
    try {
      const video = await fetchVideo(post.post_url);
      if (!video || !video.statistics) {
        await supabase
          .from("kol_tracked_posts")
          .update({ sync_status: "not_found", last_synced_at: new Date().toISOString() })
          .eq("post_id", post.post_id);
        notFound++;
        results.push({ post_id: post.post_id, status: "not_found" });
        continue;
      }

      const s = video.statistics;
      const views = s.playCount ?? 0;
      const likes = s.diggCount ?? 0;
      const comments = s.commentCount ?? 0;
      const shares = s.shareCount ?? 0;

      await supabase
        .from("kol_tracked_posts")
        .update({
          sync_status: "ok",
          views,
          likes,
          comments,
          shares,
          last_synced_at: new Date().toISOString(),
        })
        .eq("post_id", post.post_id);

      await supabase.from("kol_post_snapshots").insert({
        post_id: post.post_id,
        views,
        likes,
        comments,
        shares,
        captured_at: new Date().toISOString(),
      });

      synced++;
      results.push({ post_id: post.post_id, status: "ok", views });
    } catch (err) {
      failed++;
      results.push({ post_id: post.post_id, status: "error", error: (err as Error).message });
    }
  }

  return NextResponse.json({ synced, notFound, failed, results });
}
