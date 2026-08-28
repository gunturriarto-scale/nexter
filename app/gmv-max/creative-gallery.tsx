import { Creative } from "@/lib/gmv-max/types";
import { formatCurrency, formatNumber, formatRoi, formatViewRate } from "@/lib/gmv-max/format";
import { Avatar, CreativeStatusChip, Thumbnail } from "@/app/gmv-max/ui";

const AUTH_LABEL: Record<Creative["authorizationType"], string> = {
  TTS_TT: "Shop official",
  AFFILIATE: "Affiliate",
  TT_USER: "Business account",
  BC_AUTH_TT: "Business Center",
  AUTH_CODE: "Video code",
};

function ViewThroughBar({ c }: { c: Creative }) {
  const steps: { label: string; value: number }[] = [
    { label: "2s", value: c.viewRate2s },
    { label: "6s", value: c.viewRate6s },
    { label: "25%", value: c.viewRateP25 },
    { label: "50%", value: c.viewRateP50 },
    { label: "75%", value: c.viewRateP75 },
    { label: "100%", value: c.viewRateP100 },
  ];
  const max = Math.max(1, steps[0].value);
  return (
    <div className="flex items-end gap-1">
      {steps.map((s) => (
        <div key={s.label} className="flex flex-1 flex-col items-center gap-0.5">
          <div className="flex h-10 w-full items-end rounded-none bg-[#EDF3F8]">
            <div
              className="w-full rounded-none bg-gradient-to-t from-[#2563EB] to-[#0891B2]/70"
              style={{ height: `${Math.max(2, (s.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] text-[#7A8AA3]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CreativeCard({ creative, isFatigued }: { creative: Creative; isFatigued: boolean }) {
  const c = creative;
  const noSpend = c.cost === 0 && c.status === "AUTHORIZATION_NEEDED";
  return (
    <div className="gfx-card gfx-card-hover flex flex-col gap-2 p-3">
      <Thumbnail seed={c.videoCoverSeed} durationSec={c.durationSec} />
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-[#14213D]">{c.title}</p>
        <CreativeStatusChip status={c.status} />
      </div>
      <div className="flex items-center gap-2 text-xs text-[#7A8AA3]">
        <Avatar seed={c.ttAccountAvatarSeed} label={c.ttAccountName} size={20} />
        <span className="truncate">{c.ttAccountName}</span>
        <span className="rounded-none bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#0891B2]">
          {AUTH_LABEL[c.authorizationType]}
        </span>
        {isFatigued && (
          <span className="rounded-none bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            ⚠️ fatigue
          </span>
        )}
      </div>

      {noSpend ? (
        <p className="rounded-none bg-[#EFF6FF] px-2 py-3 text-center text-xs text-[#7A8AA3]">
          Belum ada spend — menunggu otorisasi kreator.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[#7A8AA3]">Cost</div>
              <div className="font-semibold text-[#14213D]">{formatCurrency(c.cost)}</div>
            </div>
            <div>
              <div className="text-[#7A8AA3]">ROI</div>
              <div className="font-semibold text-[#2563EB]">{formatRoi(c.roi)}</div>
            </div>
            <div>
              <div className="text-[#7A8AA3]">Orders</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(c.orders)}</div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-[#7A8AA3]">
            <span>{formatNumber(c.productImpressions)} impr.</span>
            <span>{formatNumber(c.productClicks)} klik ({c.productClickRate.toFixed(1)}%)</span>
            <span>conv. {c.adConversionRate.toFixed(1)}%</span>
          </div>
          <ViewThroughBar c={c} />
          <div className="flex justify-between text-[10px] text-[#7A8AA3]">
            <span>Watch-through 2s: {formatViewRate(c.viewRate2s)}</span>
            <span>6s: {formatViewRate(c.viewRate6s)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function CreativeGallery({ creatives, fatiguedIds }: { creatives: Creative[]; fatiguedIds: Set<string> }) {
  const sorted = [...creatives].sort((a, b) => b.cost - a.cost);
  if (sorted.length === 0) {
    return <p className="text-sm text-[#7A8AA3]">Belum ada creative untuk filter ini.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.map((c) => (
        <CreativeCard key={c.itemId} creative={c} isFatigued={fatiguedIds.has(c.itemId)} />
      ))}
    </div>
  );
}
