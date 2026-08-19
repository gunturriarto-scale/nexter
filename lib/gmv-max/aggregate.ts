import { Campaign, Creative, DailyMetric, Livestream, Product } from "@/lib/gmv-max/types";

export interface Totals {
  cost: number;
  netCost: number;
  grossRevenue: number;
  orders: number;
  roi: number;
  costPerOrder: number;
}

function emptyTotals(): Totals {
  return { cost: 0, netCost: 0, grossRevenue: 0, orders: 0, roi: 0, costPerOrder: 0 };
}

function finalizeTotals(t: Totals): Totals {
  return {
    ...t,
    roi: t.cost > 0 ? t.grossRevenue / t.cost : 0,
    costPerOrder: t.orders > 0 ? t.cost / t.orders : 0,
  };
}

export function sumDaily(rows: DailyMetric[]): Totals {
  const t = emptyTotals();
  for (const r of rows) {
    t.cost += r.cost;
    t.netCost += r.netCost;
    t.grossRevenue += r.grossRevenue;
    t.orders += r.orders;
  }
  return finalizeTotals(t);
}

export interface DayPoint {
  day: string;
  cost: number;
  grossRevenue: number;
  roi: number;
}

export function dailySeries(rows: DailyMetric[]): DayPoint[] {
  const byDay = new Map<string, { cost: number; grossRevenue: number }>();
  for (const r of rows) {
    const e = byDay.get(r.day) ?? { cost: 0, grossRevenue: 0 };
    e.cost += r.cost;
    e.grossRevenue += r.grossRevenue;
    byDay.set(r.day, e);
  }
  return Array.from(byDay.entries())
    .map(([day, v]) => ({ day, cost: v.cost, grossRevenue: v.grossRevenue, roi: v.cost > 0 ? v.grossRevenue / v.cost : 0 }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export interface CampaignRollup extends Totals {
  campaign: Campaign;
  roiVsTargetPct: number | null; // null when campaign has no target (max-delivery mode)
}

export function rollupCampaigns(campaigns: Campaign[], dailyRows: DailyMetric[]): CampaignRollup[] {
  return campaigns.map((c) => {
    const totals = sumDaily(dailyRows.filter((r) => r.campaignId === c.campaignId));
    const target = c.bidType === "CUSTOM" ? c.roasBid : null;
    return {
      campaign: c,
      ...totals,
      roiVsTargetPct: target && target > 0 ? ((totals.roi - target) / target) * 100 : null,
    };
  });
}

export interface BrandRollup extends Totals {
  brand: string;
  campaignCount: number;
  activeCampaignCount: number;
}

export function rollupBrands(brands: string[], campaigns: Campaign[], dailyRows: DailyMetric[]): BrandRollup[] {
  return brands.map((brand) => {
    const brandCampaigns = campaigns.filter((c) => c.brand === brand);
    const totals = sumDaily(dailyRows.filter((r) => r.brand === brand));
    return {
      brand,
      ...totals,
      campaignCount: brandCampaigns.length,
      activeCampaignCount: brandCampaigns.filter((c) => c.operationStatus === "ENABLE").length,
    };
  });
}

/**
 * Flags a creative as "fatigued" when its 2s/6s hook retention sits well
 * below the average for creatives in the same campaign despite meaningful
 * spend — GMV Max itself has no explicit fatigue signal, so this is a
 * derived heuristic, not an API field.
 */
export function fatiguedCreativeIds(creatives: Creative[], threshold = 0.7, minCost = 5): Set<string> {
  const byCampaign = new Map<string, Creative[]>();
  for (const c of creatives) {
    if (!byCampaign.has(c.campaignId)) byCampaign.set(c.campaignId, []);
    byCampaign.get(c.campaignId)!.push(c);
  }
  const flagged = new Set<string>();
  for (const group of byCampaign.values()) {
    const withSpend = group.filter((c) => c.cost > 0);
    if (withSpend.length === 0) continue;
    const avg2s = withSpend.reduce((a, c) => a + c.viewRate2s, 0) / withSpend.length;
    const avg6s = withSpend.reduce((a, c) => a + c.viewRate6s, 0) / withSpend.length;
    for (const c of withSpend) {
      if (c.cost >= minCost && (c.viewRate2s < avg2s * threshold || c.viewRate6s < avg6s * threshold)) {
        flagged.add(c.itemId);
      }
    }
  }
  return flagged;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  severity: AlertSeverity;
  title: string;
  detail: string;
  brand: string;
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function buildAlerts(
  campaigns: Campaign[],
  creatives: Creative[],
  livestreams: Livestream[],
  campaignRollups: CampaignRollup[]
): Alert[] {
  const alerts: Alert[] = [];
  const fatigued = fatiguedCreativeIds(creatives);

  for (const r of campaignRollups) {
    if (r.campaign.roiProtectionStatus === "NOT_ELIGIBLE") {
      alerts.push({
        severity: "warning",
        title: "ROI protection tidak aktif",
        detail: `${r.campaign.campaignName} tidak eligible dapat ad-credit kalau ROI meleset dari target.`,
        brand: r.campaign.brand,
      });
    }
    if (r.roiVsTargetPct !== null && r.roiVsTargetPct < -20 && r.cost > 20) {
      alerts.push({
        severity: "critical",
        title: "ROI jauh di bawah target",
        detail: `${r.campaign.campaignName}: ROI aktual ${r.roi.toFixed(2)}x vs target ${r.campaign.roasBid.toFixed(2)}x (${r.roiVsTargetPct.toFixed(0)}%).`,
        brand: r.campaign.brand,
      });
    }
    if (r.campaign.autoBudget.enabled && r.campaign.autoBudget.remainedTimes <= 2) {
      alerts.push({
        severity: "info",
        title: "Auto-budget hampir habis kuota naik",
        detail: `${r.campaign.campaignName}: sisa ${r.campaign.autoBudget.remainedTimes}x kenaikan otomatis sebelum mentok $${r.campaign.autoBudget.maximumBudget}.`,
        brand: r.campaign.brand,
      });
    }
  }

  for (const c of creatives) {
    const campaign = campaigns.find((cm) => cm.campaignId === c.campaignId);
    if (c.status === "REJECTED") {
      alerts.push({
        severity: "critical",
        title: "Video ditolak moderasi",
        detail: `"${c.title}" (${c.ttAccountName}) di ${campaign?.campaignName ?? c.campaignId} berstatus REJECTED.`,
        brand: c.brand,
      });
    }
    if (c.status === "AUTHORIZATION_NEEDED") {
      alerts.push({
        severity: "warning",
        title: "Video butuh otorisasi",
        detail: `"${c.title}" (${c.ttAccountName}) belum diotorisasi buat dipakai iklan — campaign ${campaign?.campaignName ?? c.campaignId}.`,
        brand: c.brand,
      });
    }
    if (fatigued.has(c.itemId)) {
      alerts.push({
        severity: "warning",
        title: "Creative fatigue",
        detail: `"${c.title}" watch-through 2s/6s jauh di bawah rata-rata campaign — kandidat di-refresh.`,
        brand: c.brand,
      });
    }
  }

  for (const l of livestreams) {
    if (l.liveStatus === "ONGOING") {
      alerts.push({
        severity: "info",
        title: "LIVE sedang berlangsung",
        detail: `${l.liveName} — ROI saat ini ${l.roi.toFixed(2)}x, ${l.liveViews.toLocaleString("id-ID")} views.`,
        brand: l.brand,
      });
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
