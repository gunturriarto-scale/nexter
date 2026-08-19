import { gradientFor, initialsFor } from "@/lib/gmv-max/visual";
import { CreativeStatus, OperationStatus, RoiProtectionStatus } from "@/lib/gmv-max/types";
import { AlertSeverity } from "@/lib/gmv-max/aggregate";

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

export function Thumbnail({ seed, durationSec }: { seed: string; durationSec: number }) {
  return (
    <div
      className="relative flex h-32 w-full items-center justify-center rounded-none text-white/90"
      style={{ background: gradientFor(seed) }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" opacity={0.85}>
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="absolute bottom-1.5 right-1.5 rounded-none bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {durationSec}s
      </span>
    </div>
  );
}

const CREATIVE_STATUS_STYLE: Record<CreativeStatus, string> = {
  DELIVERING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  LEARNING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  IN_QUEUE: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  NOT_DELIVERYING: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  AUTHORIZATION_NEEDED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  EXCLUDED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  UNAVAILABLE: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  NOT_ACTIVE: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

const CREATIVE_STATUS_LABEL: Record<CreativeStatus, string> = {
  DELIVERING: "Delivering",
  LEARNING: "Learning",
  IN_QUEUE: "In queue",
  NOT_DELIVERYING: "Not delivering",
  AUTHORIZATION_NEEDED: "Perlu otorisasi",
  EXCLUDED: "Excluded",
  UNAVAILABLE: "Unavailable",
  REJECTED: "Rejected",
  NOT_ACTIVE: "Not active",
};

export function CreativeStatusChip({ status }: { status: CreativeStatus }) {
  return (
    <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${CREATIVE_STATUS_STYLE[status]}`}>
      {CREATIVE_STATUS_LABEL[status]}
    </span>
  );
}

export function OperationStatusChip({ status }: { status: OperationStatus }) {
  const style =
    status === "ENABLE"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400";
  return <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${style}`}>{status === "ENABLE" ? "Aktif" : "Nonaktif"}</span>;
}

export function RoiProtectionChip({ status }: { status: RoiProtectionStatus }) {
  const style =
    status === "IN_EFFECT"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  return (
    <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {status === "IN_EFFECT" ? "Protected" : "Tidak eligible"}
    </span>
  );
}

export function ProductStatusChip(_: { status: string }) {
  return null;
}

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  warning: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export function SeverityDot({ severity }: { severity: AlertSeverity }) {
  const color = severity === "critical" ? "bg-rose-500" : severity === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-none ${color}`} />;
}

export function alertCardClass(severity: AlertSeverity) {
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
