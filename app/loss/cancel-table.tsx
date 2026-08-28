import { Cancellation } from "@/lib/loss/types";
import { formatCurrency2, formatDateTime } from "@/lib/loss/format";
import { CancelStatusChip, CancelTypeChip, RoleChip } from "@/app/loss/ui";

export function CancelTable({ rows }: { rows: Cancellation[] }) {
  const sorted = [...rows].sort((a, b) => b.createTime - a.createTime);

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead>
          <tr>
            {[
              "Order ID",
              "Tipe",
              "Status",
              "Role",
              "Alasan",
              "Produk",
              "Refund",
              "Subtotal",
              "Shipping",
              "Dibuat",
              "Deadline action",
            ].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={11}>
                Belum ada cancellation untuk filter ini.
              </td>
            </tr>
          )}
          {sorted.map((r) => (
            <tr key={r.cancelId} className="gfx-row-border">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-[#14213D]">
                {r.orderId}
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <CancelTypeChip type={r.cancelType} />
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <CancelStatusChip status={r.cancelStatus} />
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <RoleChip role={r.role} />
              </td>
              <td className="px-3 py-2 text-[#4B5D78]">{r.cancelReasonText}</td>
              <td className="px-3 py-2 text-[#4B5D78]">
                {r.lineItems[0]?.productName ?? "—"}
                {r.lineItems.length > 1 && ` (+${r.lineItems.length - 1})`}
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">
                {formatCurrency2(r.refundAmount.refundTotal)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                {formatCurrency2(r.refundAmount.refundSubtotal)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                {formatCurrency2(r.refundAmount.refundShippingFee)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                {formatDateTime(r.createTime)}
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                {r.sellerNextAction ? (
                  <span className="font-medium text-amber-600">
                    {formatDateTime(r.sellerNextAction.deadline)}
                  </span>
                ) : (
                  <span className="text-[#91A0B5]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
