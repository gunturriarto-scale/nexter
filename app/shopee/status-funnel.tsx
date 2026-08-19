export interface FunnelBarRow {
  label: string;
  count: number;
  pct: number;
  colorClass: string;
}

/** Lightweight horizontal bar list — used for the order-status funnel and can
 * generalize to any "count + share of total" breakdown without pulling in a
 * chart library for something this simple. */
export function StatusFunnel({ rows }: { rows: FunnelBarRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="gfx-card p-5">
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-xs text-[#6b5a66]">
              <span className="font-medium text-[#342d32]">{r.label}</span>
              <span>
                {r.count} · {r.pct.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-none bg-[#f7eef1]">
              <div
                className={`h-full ${r.colorClass}`}
                style={{ width: `${Math.max((r.count / max) * 100, r.count > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
