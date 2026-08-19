export function formatIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Compact Rupiah for KPI tiles / dense tables, e.g. Rp12,4jt, Rp850rb. */
export function formatIdrCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1).replace(".", ",")}M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace(".", ",")}jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toFixed(0)}rb`;
  return formatIdr(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatRoas(n: number): string {
  return `${n.toFixed(2)}x`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

export function maskBuyerUsername(username: string): string {
  if (username.length <= 3) return `${username[0]}***`;
  return `${username.slice(0, 2)}${"*".repeat(Math.max(username.length - 4, 3))}${username.slice(-2)}`;
}
