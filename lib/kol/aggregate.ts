import { KolCreator, KolTrackedPost } from "@/lib/kol/types";
import { classifyTier, KolTier, TIER_ORDER } from "@/lib/kol/tier";

export function engagementRate(post: KolTrackedPost): number {
  if (post.views === 0) return 0;
  return ((post.likes + post.comments + post.shares) / post.views) * 100;
}

export interface LeaderboardRow {
  creator: KolCreator;
  postCount: number;
  totalViews: number;
  avgEngagementRate: number;
  paidCost: number | null;
  paidRoi: number | null;
  paidOrders: number | null;
}

export function buildLeaderboard(
  creators: KolCreator[],
  posts: KolTrackedPost[]
): LeaderboardRow[] {
  return creators
    .map((creator) => {
      const creatorPosts = posts.filter((p) => p.creatorId === creator.creatorId && p.syncStatus === "ok");
      const totalViews = creatorPosts.reduce((a, p) => a + p.views, 0);
      const avgEngagementRate =
        creatorPosts.length > 0
          ? creatorPosts.reduce((a, p) => a + engagementRate(p), 0) / creatorPosts.length
          : 0;
      const paidPosts = creatorPosts.filter((p) => p.linkedGmvMax);
      const paidCost = paidPosts.length > 0 ? paidPosts.reduce((a, p) => a + (p.linkedGmvMax?.cost ?? 0), 0) : null;
      const paidOrders = paidPosts.length > 0 ? paidPosts.reduce((a, p) => a + (p.linkedGmvMax?.orders ?? 0), 0) : null;
      const paidRevenue =
        paidPosts.length > 0
          ? paidPosts.reduce((a, p) => a + (p.linkedGmvMax?.cost ?? 0) * (p.linkedGmvMax?.roi ?? 0), 0)
          : null;
      const paidRoi = paidCost && paidCost > 0 && paidRevenue !== null ? paidRevenue / paidCost : null;
      return {
        creator,
        postCount: creatorPosts.length,
        totalViews,
        avgEngagementRate,
        paidCost,
        paidRoi,
        paidOrders,
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews);
}

export interface TierPerformanceRow {
  tier: KolTier;
  creatorCount: number;
  totalViews: number;
  avgEngagementRate: number;
  paidCost: number | null;
  paidRoi: number | null;
}

/** Groups leaderboard rows (already per-creator totals) by follower-count tier. */
export function buildTierPerformance(rows: LeaderboardRow[]): TierPerformanceRow[] {
  const byTier = new Map<KolTier, LeaderboardRow[]>();
  for (const row of rows) {
    const tier = classifyTier(row.creator.followerCount);
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier)!.push(row);
  }

  return TIER_ORDER.filter((tier) => byTier.has(tier)).map((tier) => {
    const tierRows = byTier.get(tier)!;
    const totalViews = tierRows.reduce((a, r) => a + r.totalViews, 0);
    const avgEngagementRate = tierRows.reduce((a, r) => a + r.avgEngagementRate, 0) / tierRows.length;
    const paidRows = tierRows.filter((r) => r.paidCost !== null);
    const paidCost = paidRows.length > 0 ? paidRows.reduce((a, r) => a + (r.paidCost ?? 0), 0) : null;
    const paidRevenue =
      paidRows.length > 0 ? paidRows.reduce((a, r) => a + (r.paidCost ?? 0) * (r.paidRoi ?? 0), 0) : null;
    const paidRoi = paidCost && paidCost > 0 && paidRevenue !== null ? paidRevenue / paidCost : null;
    return {
      tier,
      creatorCount: tierRows.length,
      totalViews,
      avgEngagementRate,
      paidCost,
      paidRoi,
    };
  });
}

export interface ProductPerformanceRow {
  productFocus: string;
  creatorCount: number;
  totalViews: number;
  avgEngagementRate: number;
  paidCost: number | null;
  paidRoi: number | null;
}

/**
 * Groups leaderboard rows by the creator's primary SKU focus. "Multi-produk"
 * (brand-owned accounts promoting the whole catalog) is excluded so it
 * doesn't dwarf single-SKU KOLs in the comparison.
 */
export function buildProductPerformance(rows: LeaderboardRow[]): ProductPerformanceRow[] {
  const byProduct = new Map<string, LeaderboardRow[]>();
  for (const row of rows) {
    if (row.creator.productFocus === "Multi-produk") continue;
    const key = row.creator.productFocus;
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key)!.push(row);
  }

  return Array.from(byProduct.entries())
    .map(([productFocus, productRows]) => {
      const totalViews = productRows.reduce((a, r) => a + r.totalViews, 0);
      const avgEngagementRate = productRows.reduce((a, r) => a + r.avgEngagementRate, 0) / productRows.length;
      const paidRows = productRows.filter((r) => r.paidCost !== null);
      const paidCost = paidRows.length > 0 ? paidRows.reduce((a, r) => a + (r.paidCost ?? 0), 0) : null;
      const paidRevenue =
        paidRows.length > 0 ? paidRows.reduce((a, r) => a + (r.paidCost ?? 0) * (r.paidRoi ?? 0), 0) : null;
      const paidRoi = paidCost && paidCost > 0 && paidRevenue !== null ? paidRevenue / paidCost : null;
      return {
        productFocus,
        creatorCount: productRows.length,
        totalViews,
        avgEngagementRate,
        paidCost,
        paidRoi,
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews);
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface KolAlert {
  severity: AlertSeverity;
  title: string;
  detail: string;
  brand: string;
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function buildKolAlerts(
  creators: KolCreator[],
  posts: KolTrackedPost[]
): KolAlert[] {
  const alerts: KolAlert[] = [];
  const creatorById = new Map(creators.map((c) => [c.creatorId, c]));

  for (const post of posts) {
    const creator = creatorById.get(post.creatorId);
    if (!creator) continue;
    if (post.syncStatus === "not_found") {
      alerts.push({
        severity: "warning",
        title: "Link post tidak ditemukan",
        detail: `Post "${post.caption}" dari ${creator.displayName} sudah dihapus/tidak bisa diakses lagi.`,
        brand: post.brand,
      });
    }
    if (post.syncStatus === "private") {
      alerts.push({
        severity: "info",
        title: "Akun kreator jadi private",
        detail: `Post "${post.caption}" dari ${creator.displayName} tidak bisa disync (akun private) — angka terakhir dari ${new Date(post.lastSyncedAt).toLocaleDateString("id-ID")}.`,
        brand: post.brand,
      });
    }
    if (post.syncStatus === "error") {
      alerts.push({
        severity: "warning",
        title: "Sync link post gagal",
        detail: `Post "${post.caption}" dari ${creator.displayName} gagal di-sync — cek ulang.`,
        brand: post.brand,
      });
    }
  }

  for (const creator of creators) {
    if (creator.authorizationType === "AUTH_CODE") {
      const hasPaid = posts.some((p) => p.creatorId === creator.creatorId && p.linkedGmvMax);
      if (!hasPaid) {
        alerts.push({
          severity: "info",
          title: "Video belum diotorisasi buat iklan",
          detail: `${creator.displayName} — kontennya belum bisa diamplifikasi lewat GMV Max sampai otorisasi selesai.`,
          brand: creator.brand,
        });
      }
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
