import { gradientFor, initialsFor } from "@/lib/kol/visual";
import { AuthorizationType, CreatorSource, PostSyncStatus } from "@/lib/kol/types";
import { AlertSeverity } from "@/lib/kol/aggregate";
import { classifyTier, KolTier, TIER_LABEL } from "@/lib/kol/tier";

export function Avatar({ seed, label, size = 28 }: { seed: string; label: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-none text-[10px] font-semibold text-white"
      style={{ width: size, height: size, background: gradientFor(seed) }}
      title={label}
    >
      {initialsFor(label)}
    </div>
  );
}

const SYNC_STYLE: Record<PostSyncStatus, string> = {
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  not_found: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  private: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  error: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};
const SYNC_LABEL: Record<PostSyncStatus, string> = {
  ok: "Tersync",
  not_found: "Tidak ditemukan",
  private: "Akun private",
  error: "Gagal sync",
};
export function SyncStatusChip({ status }: { status: PostSyncStatus }) {
  return <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${SYNC_STYLE[status]}`}>{SYNC_LABEL[status]}</span>;
}

const SOURCE_LABEL: Record<CreatorSource, string> = {
  gmv_max: "GMV Max",
  shop_affiliate: "Shop affiliate",
  manual: "Ditambah manual",
  scrapecreators: "Discovery",
  kalodata: "KaloData",
};
export function SourceBadge({ source }: { source: CreatorSource }) {
  return (
    <span className="rounded-none bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#0891B2]">
      {SOURCE_LABEL[source]}
    </span>
  );
}

const AUTH_LABEL: Record<AuthorizationType, string> = {
  TTS_TT: "Shop official",
  AFFILIATE: "Affiliate",
  TT_USER: "Business account",
  BC_AUTH_TT: "Business Center",
  AUTH_CODE: "Video code",
};
export function AuthorizationBadge({ type }: { type: AuthorizationType }) {
  return (
    <span className="rounded-none bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#0891B2]">
      {AUTH_LABEL[type]}
    </span>
  );
}

const ALERT_STYLE: Record<AlertSeverity, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  warning: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
};
export function alertCardClass(severity: AlertSeverity) {
  return `rounded-none border p-3 text-sm ${ALERT_STYLE[severity]}`;
}
export function SeverityDot({ severity }: { severity: AlertSeverity }) {
  const color = severity === "critical" ? "bg-rose-500" : severity === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-none ${color}`} />;
}

const TIER_STYLE: Record<KolTier, string> = {
  Nano: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  Micro: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  Mid: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  Macro: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  Mega: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};
export function TierBadge({ followerCount }: { followerCount: number }) {
  const tier = classifyTier(followerCount);
  return <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${TIER_STYLE[tier]}`}>{TIER_LABEL[tier]}</span>;
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="gfx-card p-5">
      {title && <h3 className="mb-3 font-serif text-base font-semibold text-[#14213D]">{title}</h3>}
      {children}
    </div>
  );
}
