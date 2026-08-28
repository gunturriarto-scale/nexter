"use client";

import { Cancellation } from "@/lib/loss/types";
import { formatCurrency2, formatDateTime } from "@/lib/loss/format";
import { CancelStatusChip, CancelTypeChip, RoleChip } from "@/app/loss/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const COLUMNS: DataTableColumn<Cancellation>[] = [
  { key: "orderId", header: "Order ID", cellClassName: "whitespace-nowrap font-mono text-xs text-[#14213D]", sortAccessor: (r) => r.orderId, cell: (r) => r.orderId },
  { key: "cancelType", header: "Tipe", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.cancelType, cell: (r) => <CancelTypeChip type={r.cancelType} /> },
  { key: "cancelStatus", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.cancelStatus, cell: (r) => <CancelStatusChip status={r.cancelStatus} /> },
  { key: "role", header: "Role", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.role, cell: (r) => <RoleChip role={r.role} /> },
  { key: "reason", header: "Alasan", cellClassName: "text-[#4B5D78]", sortAccessor: (r) => r.cancelReasonText, cell: (r) => r.cancelReasonText },
  {
    key: "produk",
    header: "Produk",
    cellClassName: "text-[#4B5D78]",
    sortAccessor: (r) => r.lineItems[0]?.productName ?? "",
    cell: (r) => `${r.lineItems[0]?.productName ?? "—"}${r.lineItems.length > 1 ? ` (+${r.lineItems.length - 1})` : ""}`,
  },
  { key: "refundTotal", header: "Refund", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (r) => r.refundAmount.refundTotal, cell: (r) => formatCurrency2(r.refundAmount.refundTotal) },
  { key: "refundSubtotal", header: "Subtotal", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.refundAmount.refundSubtotal, cell: (r) => formatCurrency2(r.refundAmount.refundSubtotal) },
  { key: "refundShipping", header: "Shipping", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.refundAmount.refundShippingFee, cell: (r) => formatCurrency2(r.refundAmount.refundShippingFee) },
  { key: "createTime", header: "Dibuat", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.createTime, cell: (r) => formatDateTime(r.createTime) },
  {
    key: "deadline",
    header: "Deadline action",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (r) => r.sellerNextAction?.deadline ?? null,
    cell: (r) =>
      r.sellerNextAction ? (
        <span className="font-medium text-amber-600">{formatDateTime(r.sellerNextAction.deadline)}</span>
      ) : (
        <span className="text-[#91A0B5]">—</span>
      ),
  },
];

export function CancelTable({ rows }: { rows: Cancellation[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.cancelId}
      initialSort={{ key: "createTime", direction: "desc" }}
      minWidth={1080}
      emptyMessage="Belum ada cancellation untuk filter ini."
    />
  );
}
