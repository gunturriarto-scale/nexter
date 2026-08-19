// IDR formatting for the Indonesian market POV.

export function formatIdr(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

/** Compact IDR: 1.000 = Rp 1 Rb, 1.000.000 = Rp 1 Jt, 1.000.000.000 = Rp 1 M. */
export function formatIdrCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `Rp ${v >= 100 ? Math.round(v).toLocaleString("id-ID") : v.toFixed(1).replace(".", ",")} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${Math.round(n / 1_000_000).toLocaleString("id-ID")} Jt`;
  }
  if (abs >= 1_000) return `Rp ${Math.round(n / 1_000)} Rb`;
  return `Rp ${Math.round(n)}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Growth percent with sign, e.g. "+24.6%" / "-3.2%". */
export function formatGrowthPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

/** Percent share, e.g. "8.2%". */
export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

/** Duration in minutes → "1j 30m" style. */
export function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
}
