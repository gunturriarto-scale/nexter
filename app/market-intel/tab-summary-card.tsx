import { TabSummary, SummaryPoint, SummaryTone } from "@/lib/market-intel/summary";

const TONE_STYLE: Record<SummaryTone, { bar: string; dot: string; text: string }> = {
  positive: { bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700" },
  negative: { bar: "bg-rose-500", dot: "bg-rose-500", text: "text-rose-700" },
  warning: { bar: "bg-amber-500", dot: "bg-amber-500", text: "text-amber-700" },
  neutral: { bar: "bg-[#0891B2]", dot: "bg-[#0891B2]", text: "text-[#0891B2]" },
};

function Point({ p }: { p: SummaryPoint }) {
  const s = TONE_STYLE[p.tone];
  return (
    <div className="flex items-start gap-3 rounded-none bg-white/70 px-4 py-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-none ${s.dot}`} />
      <div>
        <div className={`text-sm font-semibold ${s.text}`}>{p.lead}</div>
        <p className="mt-0.5 text-xs leading-relaxed text-[#4B5D78]">{p.detail}</p>
      </div>
    </div>
  );
}

export function TabSummaryCard({ summary }: { summary: TabSummary }) {
  return (
    <div className="gfx-card gfx-gradient-soft p-5 ring-1 ring-[#93C5FD]/40">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h3 className="font-serif text-lg font-semibold text-[#14213D]">{summary.title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {summary.points.map((p, i) => (
          <Point key={i} p={p} />
        ))}
      </div>
    </div>
  );
}
