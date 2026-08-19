import {
  DailyLiveMetric,
  LiveCampaign,
  LiveSession,
} from "@/lib/live-gmv-max/types";

export interface LiveTotals {
  cost: number;
  netCost: number;
  orders: number;
  grossRevenue: number;
  roi: number;
  liveViews: number;
  views10s: number;
  liveFollows: number;
}

function emptyTotals(): LiveTotals {
  return {
    cost: 0,
    netCost: 0,
    orders: 0,
    grossRevenue: 0,
    roi: 0,
    liveViews: 0,
    views10s: 0,
    liveFollows: 0,
  };
}

export function sumLiveRows(rows: DailyLiveMetric[]): LiveTotals {
  const t = emptyTotals();
  for (const r of rows) {
    t.cost += r.cost;
    t.netCost += r.netCost;
    t.orders += r.orders;
    t.grossRevenue += r.grossRevenue;
    t.liveViews += r.liveViews;
    t.views10s += r.views10s;
    t.liveFollows += r.liveFollows;
  }
  t.roi = t.cost > 0 ? t.grossRevenue / t.cost : 0;
  return t;
}

export interface LiveDayPoint {
  day: string;
  cost: number;
  grossRevenue: number;
  liveViews: number;
  roi: number;
}

export function liveDailySeries(rows: DailyLiveMetric[]): LiveDayPoint[] {
  const byDay = new Map<string, { cost: number; grossRevenue: number; liveViews: number }>();
  for (const r of rows) {
    const e = byDay.get(r.day) ?? { cost: 0, grossRevenue: 0, liveViews: 0 };
    e.cost += r.cost;
    e.grossRevenue += r.grossRevenue;
    e.liveViews += r.liveViews;
    byDay.set(r.day, e);
  }
  return Array.from(byDay.entries())
    .map(([day, v]) => ({
      day,
      cost: v.cost,
      grossRevenue: v.grossRevenue,
      liveViews: v.liveViews,
      roi: v.cost > 0 ? v.grossRevenue / v.cost : 0,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export type LiveAlertSeverity = "critical" | "warning" | "info";

export interface LiveAlert {
  severity: LiveAlertSeverity;
  title: string;
  detail: string;
  brand: string;
}

const SEVERITY_RANK: Record<LiveAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function buildLiveAlerts(
  sessions: LiveSession[],
  campaigns: LiveCampaign[],
  totals: LiveTotals,
  targetRoi: number | null
): LiveAlert[] {
  const alerts: LiveAlert[] = [];

  for (const s of sessions) {
    if (s.liveStatus === "ONGOING") {
      alerts.push({
        severity: "info",
        title: "LIVE sedang berlangsung",
        detail: `${s.liveName} — ROI saat ini ${s.roi.toFixed(2)}x, ${s.liveViews.toLocaleString("id-ID")} views.`,
        brand: s.brand,
      });
    }
    if (s.liveStatus === "END" && s.orders === 0 && s.cost > 0) {
      alerts.push({
        severity: "critical",
        title: "LIVE habis tapi 0 orders",
        detail: `${s.liveName} sudah selesai dengan ${s.cost.toLocaleString("id-ID")} cost tapi tidak ada order.`,
        brand: s.brand,
      });
    }
    if (s.liveStatus === "ONGOING" && targetRoi !== null && s.roi < targetRoi * 0.7) {
      alerts.push({
        severity: "warning",
        title: "ROI live jauh di bawah target",
        detail: `${s.liveName}: ROI ${s.roi.toFixed(2)}x vs target ${targetRoi.toFixed(2)}x.`,
        brand: s.brand,
      });
    }
  }

  for (const c of campaigns) {
    if (c.roiProtectionStatus === "NOT_ELIGIBLE") {
      alerts.push({
        severity: "warning",
        title: "ROI protection tidak aktif",
        detail: `${c.campaignName} tidak eligible ad-credit kalau ROI meleset (max delivery / ROI diedit).`,
        brand: c.brand,
      });
    }
  }

  if (targetRoi !== null && totals.cost > 0 && totals.roi < targetRoi) {
    alerts.push({
      severity: "warning",
      title: "ROI kumulatif di bawah target",
      detail: `Total ROI ${totals.roi.toFixed(2)}x vs target ${targetRoi.toFixed(2)}x — cek performa per live session.`,
      brand: "Glow FX",
    });
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
