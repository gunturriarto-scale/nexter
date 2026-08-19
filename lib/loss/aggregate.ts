import { Cancellation } from "@/lib/loss/types";
import { hoursUntil } from "@/lib/loss/format";

export interface LossTotals {
  totalCancellations: number;
  totalRefund: number;
  pendingCount: number;
  pendingRefund: number;
  pendingActionCount: number; // BUYER_CANCEL pending + seller must respond
  urgentActionCount: number; // deadline < 24h
}

export function sumLoss(rows: Cancellation[]): LossTotals {
  const t: LossTotals = {
    totalCancellations: rows.length,
    totalRefund: 0,
    pendingCount: 0,
    pendingRefund: 0,
    pendingActionCount: 0,
    urgentActionCount: 0,
  };
  for (const r of rows) {
    t.totalRefund += r.refundAmount.refundTotal;
    if (r.cancelStatus === "CANCELLATION_REQUEST_PENDING") {
      t.pendingCount += 1;
      t.pendingRefund += r.refundAmount.refundTotal;
    }
    if (r.sellerNextAction) {
      t.pendingActionCount += 1;
      if (hoursUntil(r.sellerNextAction.deadline) < 24) {
        t.urgentActionCount += 1;
      }
    }
  }
  return t;
}

export interface ReasonGroup {
  reasonKey: string;
  reasonText: string;
  count: number;
  refundTotal: number;
}

export function groupByReason(rows: Cancellation[]): ReasonGroup[] {
  const map = new Map<string, ReasonGroup>();
  for (const r of rows) {
    const key = r.cancelReason;
    const g = map.get(key) ?? {
      reasonKey: key,
      reasonText: r.cancelReasonText,
      count: 0,
      refundTotal: 0,
    };
    g.count += 1;
    g.refundTotal += r.refundAmount.refundTotal;
    map.set(key, g);
  }
  return Array.from(map.values()).sort((a, b) => b.refundTotal - a.refundTotal);
}

export type LossAlertSeverity = "critical" | "warning" | "info";

export interface LossAlert {
  severity: LossAlertSeverity;
  title: string;
  detail: string;
  brand: string;
}

const SEVERITY_RANK: Record<LossAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function buildLossAlerts(rows: Cancellation[]): LossAlert[] {
  const alerts: LossAlert[] = [];
  for (const r of rows) {
    if (r.sellerNextAction) {
      const h = hoursUntil(r.sellerNextAction.deadline);
      if (h <= 6) {
        alerts.push({
          severity: "critical",
          title: "Deadline approve/reject cancel < 6 jam",
          detail: `Order ${r.orderId} (${r.cancelReasonText}) — seller harus respond sebelum deadline.`,
          brand: r.brand,
        });
      } else if (h < 24) {
        alerts.push({
          severity: "warning",
          title: "Cancel request mendekati deadline",
          detail: `Order ${r.orderId} (${r.cancelReasonText}) — sisa ${h} jam buat respond.`,
          brand: r.brand,
        });
      }
    }
    if (r.shouldReplenishStock) {
      alerts.push({
        severity: "info",
        title: "Perlu replenish stok",
        detail: `Order ${r.orderId} dicancel karena out of stock — ${r.lineItems[0]?.productName ?? ""} perlu di-replenish.`,
        brand: r.brand,
      });
    }
  }
  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
