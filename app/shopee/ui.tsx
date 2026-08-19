import { AlertSeverity } from "@/lib/shopee/aggregate";
import { OrderStatus, ReturnStatus, ProductStatus } from "@/lib/shopee/types";

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="gfx-card p-5">
      {title && <h3 className="mb-3 font-serif text-base font-semibold text-[#342d32]">{title}</h3>}
      {children}
    </div>
  );
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

export function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}% vs periode sebelumnya
    </span>
  );
}

const CHIP_BASE = "inline-flex items-center rounded-none px-2 py-0.5 text-[11px] font-semibold";

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  UNPAID: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  READY_TO_SHIP: "bg-gradient-to-r from-[#f0466d]/15 to-[#8154b6]/15 text-[#8154b6] ring-1 ring-[#c4c2f2]",
  PROCESSED: "bg-gradient-to-r from-[#f0466d]/15 to-[#8154b6]/15 text-[#8154b6] ring-1 ring-[#c4c2f2]",
  SHIPPED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  TO_CONFIRM_RECEIVE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  TO_RETURN: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  UNPAID: "Belum Bayar",
  PENDING: "Pending",
  READY_TO_SHIP: "Siap Kirim",
  PROCESSED: "Diproses",
  SHIPPED: "Dikirim",
  TO_CONFIRM_RECEIVE: "Menunggu Konfirmasi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  TO_RETURN: "Retur",
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <span className={`${CHIP_BASE} ${ORDER_STATUS_STYLE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>;
}

const RETURN_STATUS_STYLE: Record<ReturnStatus, string> = {
  REQUESTED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  JUDGING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CLOSED: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  SELLER_DISPUTE: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: "Diajukan",
  ACCEPTED: "Diterima",
  CANCELLED: "Dibatalkan",
  JUDGING: "Dalam Penilaian",
  CLOSED: "Selesai",
  PROCESSING: "Diproses",
  SELLER_DISPUTE: "Seller Dispute",
};

export function ReturnStatusChip({ status }: { status: ReturnStatus }) {
  return <span className={`${CHIP_BASE} ${RETURN_STATUS_STYLE[status]}`}>{RETURN_STATUS_LABEL[status]}</span>;
}

const PRODUCT_STATUS_STYLE: Record<ProductStatus, string> = {
  NORMAL: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  BANNED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  UNLIST: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  DELETED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  NORMAL: "Normal",
  BANNED: "Banned",
  UNLIST: "Unlist",
  DELETED: "Deleted",
};

export function ProductStatusChip({ status }: { status: ProductStatus }) {
  return <span className={`${CHIP_BASE} ${PRODUCT_STATUS_STYLE[status]}`}>{PRODUCT_STATUS_LABEL[status]}</span>;
}

export function MockupBanner({ text }: { text?: string }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#8154b6] ring-1 ring-[#c4c2f2]">
      <span className="h-2 w-2 rounded-none bg-[#f0466d]" />
      {text ?? "Mockup mode — data dummy, belum tersambung Supabase/Shopee API"}
    </div>
  );
}
