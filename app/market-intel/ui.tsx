import { formatGrowthPct } from "@/lib/market-intel/format";
import { IntelSeverity } from "@/lib/market-intel/aggregate";

export function GrowthBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${
        positive
          ? "bg-emerald-100 text-emerald-800"
          : "bg-rose-100 text-rose-700"
      }`}
    >
      {positive ? "▲" : "▼"} {formatGrowthPct(pct)}
    </span>
  );
}

/** Highlight the Glow FX row in tables. */
export function GlowChip({ name }: { name: string }) {
  if (name === "Glow FX") {
    return (
      <span className="inline-flex items-center gap-1 rounded-none bg-gradient-to-r from-[#f0466d]/12 to-[#8154b6]/12 px-2 py-0.5 text-[10px] font-bold text-[#f0466d] ring-1 ring-[#f6a7bc]/50">
        GLOW FX
      </span>
    );
  }
  return null;
}

const SEVERITY_STYLE: Record<IntelSeverity, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  info: "border-blue-300 bg-blue-50 text-blue-900",
};

export function SeverityDot({ severity }: { severity: IntelSeverity }) {
  const color =
    severity === "critical" ? "bg-rose-500" : severity === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-none ${color}`} />;
}

export function insightCardClass(severity: IntelSeverity) {
  return `rounded-none border p-3 text-sm ${SEVERITY_STYLE[severity]}`;
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="gfx-card p-5">
      {title && <h3 className="mb-3 font-serif text-base font-semibold text-[#342d32]">{title}</h3>}
      {children}
    </div>
  );
}
