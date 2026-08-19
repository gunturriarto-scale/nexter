import {
  ShopeeAccountHealthDay,
  ShopeeAdsDaily,
  ShopeeOrder,
  ShopeeProduct,
  ShopeeReturn,
  OrderStatus,
} from "@/lib/shopee/types";

// ---------------------------------------------------------------------------
// Executive KPIs
// ---------------------------------------------------------------------------

const REVENUE_STATUSES = new Set<OrderStatus>([
  "PENDING",
  "READY_TO_SHIP",
  "PROCESSED",
  "SHIPPED",
  "TO_CONFIRM_RECEIVE",
  "COMPLETED",
  "TO_RETURN",
]);

export function isRevenueOrder(o: ShopeeOrder): boolean {
  return REVENUE_STATUSES.has(o.orderStatus);
}

export interface ExecutiveKpis {
  gmv: number;
  ordersCompleted: number;
  aov: number;
  returnRate: number;
  escrowPending: number;
}

export function computeExecutiveKpis(orders: ShopeeOrder[], returns: ShopeeReturn[]): ExecutiveKpis {
  const revenueOrders = orders.filter(isRevenueOrder);
  const gmv = revenueOrders.reduce((s, o) => s + o.totalAmount, 0);
  const completed = orders.filter((o) => o.orderStatus === "COMPLETED");
  const aov = revenueOrders.length > 0 ? gmv / revenueOrders.length : 0;
  const returnRate = orders.length > 0 ? (returns.length / orders.length) * 100 : 0;
  const escrowPending = orders
    .filter((o) => o.escrowAmount !== null && !o.escrowReleased)
    .reduce((s, o) => s + (o.escrowAmount ?? 0), 0);
  return { gmv, ordersCompleted: completed.length, aov, returnRate, escrowPending };
}

export interface DayPoint {
  [key: string]: string | number;
  day: string;
  gmv: number;
  orders: number;
}

export function gmvDailySeries(orders: ShopeeOrder[]): DayPoint[] {
  const byDay = new Map<string, { gmv: number; orders: number }>();
  for (const o of orders) {
    if (!isRevenueOrder(o)) continue;
    const day = o.createTime.slice(0, 10);
    const e = byDay.get(day) ?? { gmv: 0, orders: 0 };
    e.gmv += o.totalAmount;
    e.orders += 1;
    byDay.set(day, e);
  }
  return Array.from(byDay.entries())
    .map(([day, v]) => ({ day, ...v }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

// ---------------------------------------------------------------------------
// Order status funnel + action queue
// ---------------------------------------------------------------------------

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "UNPAID",
  "PENDING",
  "READY_TO_SHIP",
  "PROCESSED",
  "SHIPPED",
  "TO_CONFIRM_RECEIVE",
  "COMPLETED",
];
export const ORDER_STATUS_SIDE: OrderStatus[] = ["CANCELLED", "TO_RETURN"];

export interface FunnelRow {
  status: OrderStatus;
  count: number;
  pct: number;
}

export function buildOrderStatusFunnel(orders: ShopeeOrder[]): { main: FunnelRow[]; side: FunnelRow[] } {
  const total = orders.length || 1;
  const counts = new Map<OrderStatus, number>();
  for (const o of orders) counts.set(o.orderStatus, (counts.get(o.orderStatus) ?? 0) + 1);
  const toRow = (s: OrderStatus): FunnelRow => {
    const count = counts.get(s) ?? 0;
    return { status: s, count, pct: (count / total) * 100 };
  };
  return { main: ORDER_STATUS_FLOW.map(toRow), side: ORDER_STATUS_SIDE.map(toRow) };
}

export interface ActionableOrder {
  order: ShopeeOrder;
  overdue: boolean;
  daysLeft: number;
}

export function buildActionableOrders(orders: ShopeeOrder[]): ActionableOrder[] {
  const now = Date.now();
  return orders
    .filter((o) => o.orderStatus === "READY_TO_SHIP" && o.shipByDate)
    .map((order) => {
      const deadline = new Date(order.shipByDate as string).getTime();
      const daysLeft = Math.round((deadline - now) / 86_400_000);
      return { order, overdue: deadline < now, daysLeft };
    })
    .sort((a, b) => new Date(a.order.shipByDate as string).getTime() - new Date(b.order.shipByDate as string).getTime());
}

export interface LogisticsSummaryRow {
  carrier: string;
  orderCount: number;
}

export function buildLogisticsSummary(orders: ShopeeOrder[]): {
  byCarrier: LogisticsSummaryRow[];
  firstMileBound: number;
  firstMileUnbound: number;
} {
  const shippable = orders.filter((o) => o.orderStatus !== "UNPAID");
  const byCarrierMap = new Map<string, number>();
  for (const o of shippable) byCarrierMap.set(o.shippingCarrier, (byCarrierMap.get(o.shippingCarrier) ?? 0) + 1);
  const byCarrier = Array.from(byCarrierMap.entries())
    .map(([carrier, orderCount]) => ({ carrier, orderCount }))
    .sort((a, b) => b.orderCount - a.orderCount);
  const needsBinding = orders.filter((o) => o.orderStatus === "READY_TO_SHIP" || o.orderStatus === "PROCESSED");
  const firstMileBound = needsBinding.filter((o) => o.firstMileBound).length;
  const firstMileUnbound = needsBinding.length - firstMileBound;
  return { byCarrier, firstMileBound, firstMileUnbound };
}

// ---------------------------------------------------------------------------
// Products / Pareto
// ---------------------------------------------------------------------------

export interface ParetoRow {
  product: ShopeeProduct;
  revenue: number;
  cumulativePct: number;
}

export function buildProductPareto(products: ShopeeProduct[]): ParetoRow[] {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
  const total = sorted.reduce((s, p) => s + p.revenue, 0) || 1;
  let cumulative = 0;
  return sorted.map((product) => {
    cumulative += product.revenue;
    return { product, revenue: product.revenue, cumulativePct: (cumulative / total) * 100 };
  });
}

export function lowStockProducts(products: ShopeeProduct[], threshold = 15): ShopeeProduct[] {
  return products.filter((p) => p.status === "NORMAL" && p.stock <= threshold).sort((a, b) => a.stock - b.stock);
}

// ---------------------------------------------------------------------------
// Returns
// ---------------------------------------------------------------------------

export interface ReturnKpis {
  totalRequests: number;
  returnRatePct: number;
  avgResolutionDays: number;
  refundValue: number;
}

export function computeReturnKpis(orders: ShopeeOrder[], returns: ShopeeReturn[]): ReturnKpis {
  const resolved = returns.filter((r) => r.status === "CLOSED" || r.status === "ACCEPTED");
  const totalResolutionDays = resolved.reduce(
    (s, r) => s + Math.max(0, Math.round((new Date(r.updateTime).getTime() - new Date(r.createTime).getTime()) / 86_400_000)),
    0
  );
  return {
    totalRequests: returns.length,
    returnRatePct: orders.length > 0 ? (returns.length / orders.length) * 100 : 0,
    avgResolutionDays: resolved.length > 0 ? totalResolutionDays / resolved.length : 0,
    refundValue: returns.reduce((s, r) => s + r.refundAmount, 0),
  };
}

export interface ReturnReasonRow {
  reason: string;
  count: number;
}

export function buildReturnReasonBreakdown(returns: ShopeeReturn[]): ReturnReasonRow[] {
  const map = new Map<string, number>();
  for (const r of returns) map.set(r.reason, (map.get(r.reason) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export interface ReturnTrendPoint {
  [key: string]: string | number;
  day: string;
  orders: number;
  returns: number;
  ratePct: number;
}

export function returnDailySeries(orders: ShopeeOrder[], returns: ShopeeReturn[]): ReturnTrendPoint[] {
  const ordersByDay = new Map<string, number>();
  for (const o of orders) {
    const day = o.createTime.slice(0, 10);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
  }
  const returnsByDay = new Map<string, number>();
  for (const r of returns) {
    const day = r.createTime.slice(0, 10);
    returnsByDay.set(day, (returnsByDay.get(day) ?? 0) + 1);
  }
  const days = Array.from(new Set([...ordersByDay.keys(), ...returnsByDay.keys()])).sort();
  return days.map((day) => {
    const ord = ordersByDay.get(day) ?? 0;
    const ret = returnsByDay.get(day) ?? 0;
    return { day, orders: ord, returns: ret, ratePct: ord > 0 ? (ret / ord) * 100 : 0 };
  });
}

export interface TopReturnedProductRow {
  itemName: string;
  count: number;
}

export function topReturnedProducts(returns: ShopeeReturn[], orders: ShopeeOrder[]): TopReturnedProductRow[] {
  const orderMap = new Map(orders.map((o) => [o.orderSn, o]));
  const counts = new Map<string, number>();
  for (const r of returns) {
    const order = orderMap.get(r.orderSn);
    if (!order) continue;
    for (const item of order.items) {
      counts.set(item.itemName, (counts.get(item.itemName) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([itemName, count]) => ({ itemName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

// ---------------------------------------------------------------------------
// Ads (AMS)
// ---------------------------------------------------------------------------

export interface AdsTotals {
  cost: number;
  gmv: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  orders: number;
  conversionRate: number;
}

export function sumAds(rows: ShopeeAdsDaily[]): AdsTotals {
  const t = rows.reduce(
    (a, r) => ({
      cost: a.cost + r.cost,
      gmv: a.gmv + r.gmv,
      impressions: a.impressions + r.impressions,
      clicks: a.clicks + r.clicks,
      orders: a.orders + r.directOrders + r.broadOrders,
    }),
    { cost: 0, gmv: 0, impressions: 0, clicks: 0, orders: 0 }
  );
  return {
    ...t,
    roas: t.cost > 0 ? t.gmv / t.cost : 0,
    ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0,
    conversionRate: t.clicks > 0 ? (t.orders / t.clicks) * 100 : 0,
  };
}

export interface AdsDayPoint {
  [key: string]: string | number;
  day: string;
  cost: number;
  gmv: number;
  roas: number;
}

export function adsDailySeries(rows: ShopeeAdsDaily[]): AdsDayPoint[] {
  const byDay = new Map<string, { cost: number; gmv: number }>();
  for (const r of rows) {
    const e = byDay.get(r.day) ?? { cost: 0, gmv: 0 };
    e.cost += r.cost;
    e.gmv += r.gmv;
    byDay.set(r.day, e);
  }
  return Array.from(byDay.entries())
    .map(([day, v]) => ({ day, cost: v.cost, gmv: v.gmv, roas: v.cost > 0 ? v.gmv / v.cost : 0 }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export interface AdsCampaignRollup extends AdsTotals {
  campaignId: string;
  campaignName: string;
  adType: ShopeeAdsDaily["adType"];
  status: ShopeeAdsDaily["status"];
}

export function rollupAdsCampaigns(rows: ShopeeAdsDaily[]): AdsCampaignRollup[] {
  const byCampaign = new Map<string, ShopeeAdsDaily[]>();
  for (const r of rows) {
    if (!byCampaign.has(r.campaignId)) byCampaign.set(r.campaignId, []);
    byCampaign.get(r.campaignId)!.push(r);
  }
  return Array.from(byCampaign.values())
    .map((campaignRows) => {
      const meta = campaignRows[0];
      return {
        campaignId: meta.campaignId,
        campaignName: meta.campaignName,
        adType: meta.adType,
        status: meta.status,
        ...sumAds(campaignRows),
      };
    })
    .sort((a, b) => b.gmv - a.gmv);
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  severity: AlertSeverity;
  title: string;
  detail: string;
}

const SEVERITY_RANK: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function buildAlerts(
  kpis: ExecutiveKpis,
  orders: ShopeeOrder[],
  products: ShopeeProduct[],
  health: ShopeeAccountHealthDay[]
): Alert[] {
  const alerts: Alert[] = [];

  if (kpis.returnRate > 8) {
    alerts.push({
      severity: "critical",
      title: "Return rate di atas ambang batas",
      detail: `Return rate ${kpis.returnRate.toFixed(1)}% — di atas target internal 8%.`,
    });
  }

  const overdue = buildActionableOrders(orders).filter((a) => a.overdue);
  if (overdue.length > 0) {
    alerts.push({
      severity: "critical",
      title: "Order lewat batas kirim",
      detail: `${overdue.length} order berstatus READY_TO_SHIP sudah lewat ship-by date — cek tab Order & Fulfillment.`,
    });
  }

  const outOfStock = products.filter((p) => p.status === "NORMAL" && p.stock === 0);
  if (outOfStock.length > 0) {
    alerts.push({
      severity: "warning",
      title: "Produk stok habis",
      detail: `${outOfStock.length} SKU aktif stoknya 0 — berisiko hilang dari pencarian.`,
    });
  }

  if (kpis.escrowPending > 8_000_000) {
    alerts.push({
      severity: "info",
      title: "Escrow pending cukup besar",
      detail: `Dana belum di-payout menumpuk — cek jadwal pencairan di Shopee Seller Center.`,
    });
  }

  const latestHealth = health[health.length - 1];
  if (latestHealth && latestHealth.penaltyPoints >= 3) {
    alerts.push({
      severity: "warning",
      title: "Penalty point toko naik",
      detail: `Skor penalty saat ini ${latestHealth.penaltyPoints} poin — risiko penalti visibility kalau terus naik.`,
    });
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

// ---------------------------------------------------------------------------
// Content: Live & Video
// ---------------------------------------------------------------------------

export function sumField<T>(rows: T[], key: (row: T) => number): number {
  return rows.reduce((s, r) => s + key(r), 0);
}
