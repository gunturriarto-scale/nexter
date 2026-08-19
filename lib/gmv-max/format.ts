export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

/** roi here is computed as gross_revenue / cost (a multiplier), not the raw API "roi" field's own scale. */
export function formatRoi(n: number): string {
  return `${n.toFixed(2)}x`;
}

/** ad_video_view_rate_* fields come back from the API already on a 0-100 scale. */
export function formatViewRate(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatPercentDelta(actual: number, target: number): string {
  if (target === 0) return "—";
  const delta = ((actual - target) / target) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(0)}%`;
}

export function formatDurationSec(s: number): string {
  return `${s}s`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
