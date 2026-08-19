import { LiveStatus } from "@/lib/live-gmv-max/types";
import { LiveAlertSeverity } from "@/lib/live-gmv-max/aggregate";

export function LiveStatusBadge({ status }: { status: LiveStatus }) {
  if (status === "ONGOING") {
    return (
      <span className="flex items-center gap-1.5 rounded-none bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-rose-500" />
        LIVE NOW
      </span>
    );
  }
  return (
    <span className="rounded-none bg-[#f7eef1] px-2 py-0.5 text-[11px] font-medium text-[#9d8a97]">
      Selesai
    </span>
  );
}

export function OperationStatusChip({ status }: { status: "ENABLE" | "DISABLE" }) {
  const style =
    status === "ENABLE"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-neutral-100 text-neutral-500";
  return (
    <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {status === "ENABLE" ? "Aktif" : "Nonaktif"}
    </span>
  );
}

export function RoiProtectionChip({ status }: { status: "IN_EFFECT" | "NOT_ELIGIBLE" }) {
  const style =
    status === "IN_EFFECT"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {status === "IN_EFFECT" ? "Protected" : "Tidak eligible"}
    </span>
  );
}

export function BidTypeChip({ bidType }: { bidType: "CUSTOM" | "NO_BID" }) {
  return (
    <span className="rounded-none bg-[#fdf0f3] px-1.5 py-0.5 text-[10px] font-medium text-[#8154b6]">
      {bidType === "CUSTOM" ? "Target ROI" : "Max delivery"}
    </span>
  );
}

const SEVERITY_STYLE: Record<LiveAlertSeverity, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  info: "border-blue-300 bg-blue-50 text-blue-900",
};

export function SeverityDot({ severity }: { severity: LiveAlertSeverity }) {
  const color =
    severity === "critical" ? "bg-rose-500" : severity === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-none ${color}`} />;
}

export function alertCardClass(severity: LiveAlertSeverity) {
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
