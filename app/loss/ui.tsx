import { CancelStatus, CancelType, CancelRole } from "@/lib/loss/types";
import { LossAlertSeverity } from "@/lib/loss/aggregate";

const STATUS_STYLE: Record<CancelStatus, string> = {
  CANCELLATION_REQUEST_PENDING: "bg-amber-100 text-amber-800",
  CANCELLATION_REQUEST_SUCCESS: "bg-emerald-100 text-emerald-800",
  CANCELLATION_REQUEST_CANCELLED: "bg-neutral-100 text-neutral-500",
  CANCELLATION_REQUEST_COMPLETE: "bg-blue-100 text-blue-800",
};
const STATUS_LABEL: Record<CancelStatus, string> = {
  CANCELLATION_REQUEST_PENDING: "Pending",
  CANCELLATION_REQUEST_SUCCESS: "Disetujui",
  CANCELLATION_REQUEST_CANCELLED: "Dibatalkan",
  CANCELLATION_REQUEST_COMPLETE: "Selesai",
};

export function CancelStatusChip({ status }: { status: CancelStatus }) {
  return (
    <span className={`rounded-none px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

const TYPE_LABEL: Record<CancelType, string> = {
  CANCEL: "Seller / system",
  BUYER_CANCEL: "Buyer",
};
export function CancelTypeChip({ type }: { type: CancelType }) {
  return (
    <span className="rounded-none bg-[#EFF6FF] px-1.5 py-0.5 text-[10px] font-medium text-[#0891B2]">
      {TYPE_LABEL[type]}
    </span>
  );
}

const ROLE_LABEL: Record<CancelRole, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  SYSTEM: "System",
};
export function RoleChip({ role }: { role: CancelRole }) {
  return (
    <span className="rounded-none bg-[#EDF3F8] px-1.5 py-0.5 text-[10px] font-medium text-[#7A8AA3]">
      {ROLE_LABEL[role]}
    </span>
  );
}

const SEVERITY_STYLE: Record<LossAlertSeverity, string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  info: "border-blue-300 bg-blue-50 text-blue-900",
};

export function SeverityDot({ severity }: { severity: LossAlertSeverity }) {
  const color =
    severity === "critical" ? "bg-rose-500" : severity === "warning" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-none ${color}`} />;
}

export function alertCardClass(severity: LossAlertSeverity) {
  return `rounded-none border p-3 text-sm ${SEVERITY_STYLE[severity]}`;
}

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="gfx-card p-5">
      {title && <h3 className="mb-3 font-serif text-base font-semibold text-[#14213D]">{title}</h3>}
      {children}
    </div>
  );
}
