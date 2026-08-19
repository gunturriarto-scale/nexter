import {
  ShopeeAccountHealthDay,
  ShopeeAdsDaily,
  ShopeeAffiliatePerformance,
  ShopeeLivestreamSession,
  ShopeeOrder,
  ShopeeOrderItem,
  ShopeeProduct,
  ShopeeReturn,
  ShopeeShop,
  ShopeeVideo,
  OrderStatus,
  ReturnStatus,
  ReturnReason,
} from "@/lib/shopee/types";

/**
 * Full mockup dataset — no Supabase/Shopee API calls yet (dev account not
 * approved, see docs/shopee-open-api.md checklist). Swap for lib/shopee/queries.ts
 * (real Supabase reads) once Wave 2+ sync routes land, same pattern as
 * lib/gmv-max/mock-data.ts → lib/gmv-max/queries.ts.
 *
 * Single shop: Glow FX Beauty Official Shop, generated with a seeded RNG so
 * numbers stay stable across reloads within the same server process.
 */

function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(20260819);
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickWeighted<T extends string>(weights: [T, number][]): T {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [value, w] of weights) {
    r -= w;
    if (r <= 0) return value;
  }
  return weights[weights.length - 1][0];
}
function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function round0(n: number) {
  return Math.round(n);
}
function isoDaysAgo(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}
function isoDatetimeAgo(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}
function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const RANGE_DAYS = 21;

export const MOCK_SHOP: ShopeeShop = {
  shopId: "shopee-glowfx-id",
  shopName: "Glow FX Beauty Official Shop",
  brand: "Glow FX",
  region: "ID",
};

// ---------------------------------------------------------------------------
// Product catalog
// ---------------------------------------------------------------------------

interface CatalogEntry {
  itemId: string;
  itemName: string;
  itemSku: string;
  categoryName: string;
  basePrice: number;
  models: { modelName: string; skuSuffix: string; priceDelta: number }[];
}

const CATALOG: CatalogEntry[] = [
  {
    itemId: "shp-1001",
    itemName: "Glow Bomb Brightening Serum 30ml",
    itemSku: "GFX-SER-001",
    categoryName: "Serum",
    basePrice: 89000,
    models: [
      { modelName: "30ml", skuSuffix: "30", priceDelta: 0 },
      { modelName: "15ml (Travel Size)", skuSuffix: "15", priceDelta: -44000 },
    ],
  },
  {
    itemId: "shp-1002",
    itemName: "Coral Glow Sunscreen SPF50 PA++++",
    itemSku: "GFX-SUN-002",
    categoryName: "Sunscreen",
    basePrice: 75000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1003",
    itemName: "Pink Petal Lip Tint",
    itemSku: "GFX-LIP-003",
    categoryName: "Lip Care",
    basePrice: 49000,
    models: [
      { modelName: "01 Blush Coral", skuSuffix: "01", priceDelta: 0 },
      { modelName: "02 Soft Pink", skuSuffix: "02", priceDelta: 0 },
      { modelName: "03 Peach Nude", skuSuffix: "03", priceDelta: 0 },
    ],
  },
  {
    itemId: "shp-1004",
    itemName: "Lavender Calm Toner 150ml",
    itemSku: "GFX-TON-004",
    categoryName: "Toner",
    basePrice: 65000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1005",
    itemName: "Blush Dew Moisturizer Gel Cream",
    itemSku: "GFX-MOI-005",
    categoryName: "Moisturizer",
    basePrice: 95000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1006",
    itemName: "Peach Radiance Gentle Cleanser 100ml",
    itemSku: "GFX-CLN-006",
    categoryName: "Cleanser",
    basePrice: 59000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1007",
    itemName: "Soft Glow Setting Mist",
    itemSku: "GFX-MST-007",
    categoryName: "Mist",
    basePrice: 69000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1008",
    itemName: "Purple Rice Barrier Repair Cream",
    itemSku: "GFX-CRM-008",
    categoryName: "Moisturizer",
    basePrice: 119000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1009",
    itemName: "Glow Shield Sunscreen Stick SPF45",
    itemSku: "GFX-SUN-009",
    categoryName: "Sunscreen",
    basePrice: 55000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1010",
    itemName: "Dewy Base Primer Lavender",
    itemSku: "GFX-PRM-010",
    categoryName: "Makeup Base",
    basePrice: 85000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1011",
    itemName: "Glow FX Charcoal Pore Clay Mask",
    itemSku: "GFX-MSK-011",
    categoryName: "Mask",
    basePrice: 45000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1012",
    itemName: "Glow Bomb Niacinamide Essence 50ml",
    itemSku: "GFX-ESS-012",
    categoryName: "Serum",
    basePrice: 79000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1013",
    itemName: "Coral Glow Lip Balm SPF15",
    itemSku: "GFX-LIP-013",
    categoryName: "Lip Care",
    basePrice: 39000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
  {
    itemId: "shp-1014",
    itemName: "Glow FX Bestseller Bundle (Serum + Sunscreen)",
    itemSku: "GFX-BDL-014",
    categoryName: "Bundle",
    basePrice: 149000,
    models: [{ modelName: "Default", skuSuffix: "DF", priceDelta: 0 }],
  },
];

export const MOCK_PRODUCTS: ShopeeProduct[] = CATALOG.map((c, i) => {
  const status = i === 12 ? "UNLIST" : rng() < 0.03 ? "BANNED" : "NORMAL";
  const unitsSold = randInt(20, 620);
  const revenue = unitsSold * c.basePrice;
  return {
    itemId: c.itemId,
    shopId: MOCK_SHOP.shopId,
    itemName: c.itemName,
    itemSku: c.itemSku,
    categoryName: c.categoryName,
    price: c.basePrice,
    stock: status === "NORMAL" ? randInt(0, 400) : randInt(0, 40),
    status,
    views: randInt(800, 42000),
    likes: randInt(20, 1800),
    unitsSold,
    revenue,
    ratingStar: Math.round((4.4 + rng() * 0.6) * 10) / 10,
    imageSeed: c.itemId,
    models: c.models.map((m, mi) => ({
      modelId: `${c.itemId}-m${mi + 1}`,
      modelName: m.modelName,
      modelSku: `${c.itemSku}-${m.skuSuffix}`,
      price: c.basePrice + m.priceDelta,
      stock: randInt(0, 150),
    })),
  };
}).sort((a, b) => b.revenue - a.revenue);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

const ORDER_STATUS_WEIGHTS: [OrderStatus, number][] = [
  ["COMPLETED", 40],
  ["SHIPPED", 10],
  ["TO_CONFIRM_RECEIVE", 8],
  ["READY_TO_SHIP", 12],
  ["PROCESSED", 6],
  ["PENDING", 5],
  ["UNPAID", 6],
  ["CANCELLED", 8],
  ["TO_RETURN", 5],
];

const CARRIERS = ["J&T Express", "JNE", "SiCepat", "Ninja Xpress", "AnterAja"];

function randomBuyerUsername(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const a = letters[randInt(0, 25)];
  const b = letters[randInt(0, 25)];
  return `${a}${b}${randInt(10, 99)}_shopper`;
}

function buildOrderItems(): ShopeeOrderItem[] {
  const n = randInt(1, 3);
  const chosen = new Set<string>();
  const items: ShopeeOrderItem[] = [];
  while (items.length < n) {
    const product = pick(MOCK_PRODUCTS);
    if (chosen.has(product.itemId)) continue;
    chosen.add(product.itemId);
    const model = pick(product.models);
    const qty = randInt(1, 2);
    items.push({
      itemId: product.itemId,
      modelId: model.modelId,
      itemName: product.itemName,
      modelName: model.modelName,
      quantityPurchased: qty,
      itemPrice: model.price,
      discountedPrice: model.price,
    });
  }
  return items;
}

export const MOCK_ORDERS: ShopeeOrder[] = Array.from({ length: 72 }, (_, i) => {
  const hoursAgo = randInt(1, RANGE_DAYS * 24);
  const createTime = isoDatetimeAgo(hoursAgo);
  const status = pickWeighted(ORDER_STATUS_WEIGHTS);
  const items = buildOrderItems();
  const totalAmount = items.reduce((s, it) => s + it.discountedPrice * it.quantityPurchased, 0);
  const isRevenue = status !== "UNPAID" && status !== "CANCELLED";
  const createdDaysAgo = hoursAgo / 24;
  const escrowReleased = status === "COMPLETED" && createdDaysAgo > 7;
  return {
    orderSn: `ID${250000000 + i * 137}`,
    shopId: MOCK_SHOP.shopId,
    orderStatus: status,
    createTime,
    payTime: status === "UNPAID" ? null : addDaysIso(createTime, 0),
    shipByDate: status === "UNPAID" ? null : addDaysIso(createTime, 2),
    totalAmount,
    currency: "IDR",
    buyerUsername: randomBuyerUsername(),
    items,
    cancelReason: status === "CANCELLED" ? pick(["OUT_OF_STOCK", "UNDELIVERABLE_AREA"] as const) : null,
    shippingCarrier: pick(CARRIERS),
    actualShippingFee: randInt(9000, 22000),
    escrowAmount: isRevenue ? round0(totalAmount * 0.97) : null,
    escrowReleased,
    firstMileBound: status === "UNPAID" || status === "PENDING" ? false : rng() > 0.08,
  };
}).sort((a, b) => (a.createTime < b.createTime ? 1 : -1));

// ---------------------------------------------------------------------------
// Returns
// ---------------------------------------------------------------------------

const RETURN_STATUS_WEIGHTS: [ReturnStatus, number][] = [
  ["CLOSED", 40],
  ["ACCEPTED", 15],
  ["REQUESTED", 15],
  ["JUDGING", 12],
  ["PROCESSING", 10],
  ["SELLER_DISPUTE", 5],
  ["CANCELLED", 3],
];

const RETURN_REASON_WEIGHTS: [ReturnReason, number][] = [
  ["CHANGE_MIND", 28],
  ["ITEM_DAMAGED", 20],
  ["WRONG_ITEM", 16],
  ["DIFF_DESC", 14],
  ["NONRECEIPT", 10],
  ["EXPIRED_PRODUCT", 7],
  ["ITEM_FAKE", 5],
];

const candidateOrders = MOCK_ORDERS.filter((o) => o.orderStatus !== "UNPAID").slice(0, 40);

export const MOCK_RETURNS: ShopeeReturn[] = Array.from({ length: 15 }, (_, i) => {
  const order = candidateOrders[(i * 7) % candidateOrders.length];
  const status = pickWeighted(RETURN_STATUS_WEIGHTS);
  const createTime = addDaysIso(order.createTime, randInt(1, 4));
  const resolutionDays = status === "CLOSED" || status === "ACCEPTED" ? randInt(1, 6) : randInt(0, 3);
  return {
    returnSn: `RE${900000 + i * 91}`,
    orderSn: order.orderSn,
    shopId: MOCK_SHOP.shopId,
    status,
    reason: pickWeighted(RETURN_REASON_WEIGHTS),
    refundAmount: round0(order.totalAmount * (0.7 + rng() * 0.3)),
    createTime,
    updateTime: addDaysIso(createTime, resolutionDays),
  };
});

// ---------------------------------------------------------------------------
// Ads (AMS)
// ---------------------------------------------------------------------------

const AD_CAMPAIGNS: { campaignId: string; campaignName: string; adType: ShopeeAdsDaily["adType"]; status: ShopeeAdsDaily["status"]; dailyCost: number; roasBase: number }[] = [
  { campaignId: "ams-c1", campaignName: "Glow FX — Shop Ads Auto", adType: "SHOP", status: "ONGOING", dailyCost: 220000, roasBase: 4.2 },
  { campaignId: "ams-c2", campaignName: "Glow FX — Keyword Ads: Serum Wajah", adType: "KEYWORD", status: "ONGOING", dailyCost: 150000, roasBase: 3.4 },
  { campaignId: "ams-c3", campaignName: "Glow FX — Product Ads: Bestseller", adType: "PRODUCT", status: "ONGOING", dailyCost: 180000, roasBase: 5.1 },
  { campaignId: "ams-c4", campaignName: "Glow FX — Flash Sale Boost", adType: "PRODUCT", status: "PAUSED", dailyCost: 90000, roasBase: 2.8 },
];

export const MOCK_ADS_DAILY: ShopeeAdsDaily[] = AD_CAMPAIGNS.flatMap((c) =>
  Array.from({ length: RANGE_DAYS }, (_, d) => {
    const day = isoDaysAgo(RANGE_DAYS - 1 - d);
    const active = c.status !== "PAUSED" || d < RANGE_DAYS - 5;
    const cost = active ? round0(c.dailyCost * (0.7 + rng() * 0.6)) : round0(c.dailyCost * 0.15);
    const roas = Math.max(0.8, c.roasBase + (rng() - 0.5) * 1.4);
    const gmv = round0(cost * roas);
    const impressions = randInt(4000, 26000);
    const clicks = round0(impressions * (0.012 + rng() * 0.02));
    const orders = round0(clicks * (0.03 + rng() * 0.05));
    return {
      day,
      campaignId: c.campaignId,
      campaignName: c.campaignName,
      adType: c.adType,
      status: c.status,
      cost,
      gmv,
      impressions,
      clicks,
      directOrders: round0(orders * 0.7),
      broadOrders: round0(orders * 0.3),
    };
  })
);

export const MOCK_AFFILIATES: ShopeeAffiliatePerformance[] = Array.from({ length: 8 }, (_, i) => {
  const clicks = randInt(300, 5200);
  const orders = round0(clicks * (0.02 + rng() * 0.05));
  const gmv = orders * randInt(60000, 140000);
  return {
    affiliateId: `aff-${i + 1}`,
    affiliateName: `@glowfx.creator${i + 1}`,
    clicks,
    orders,
    gmv,
    commission: round0(gmv * 0.1),
  };
}).sort((a, b) => b.gmv - a.gmv);

// ---------------------------------------------------------------------------
// Account health
// ---------------------------------------------------------------------------

export const MOCK_ACCOUNT_HEALTH: ShopeeAccountHealthDay[] = Array.from({ length: RANGE_DAYS }, (_, d) => {
  const day = isoDaysAgo(RANGE_DAYS - 1 - d);
  const trendUp = d > RANGE_DAYS - 5; // small penalty bump in the last few days
  return {
    day,
    penaltyPoints: trendUp ? randInt(2, 4) : randInt(0, 1),
    lateOrderRate: Math.round((1 + rng() * (trendUp ? 3 : 1.5)) * 10) / 10,
    nonFulfillmentRate: Math.round((0.5 + rng() * 1.5) * 10) / 10,
    listingViolationCount: trendUp ? randInt(1, 3) : 0,
    responseRate: Math.round((95 + rng() * 4.5) * 10) / 10,
  };
});

// ---------------------------------------------------------------------------
// Content: Live & Video
// ---------------------------------------------------------------------------

export const MOCK_LIVESTREAMS: ShopeeLivestreamSession[] = Array.from({ length: 6 }, (_, i) => {
  const views = randInt(1200, 18000);
  const orders = round0(views * (0.004 + rng() * 0.01));
  return {
    sessionId: `live-${i + 1}`,
    title: pick([
      "Glow FX LIVE — Payday Sale",
      "Glow FX LIVE — Skincare 101 & Flash Deal",
      "Glow FX LIVE — Bestseller Restock",
      "Glow FX LIVE — Weekend Glow Up",
    ]),
    startTime: isoDatetimeAgo(randInt(6, RANGE_DAYS * 24)),
    durationMin: randInt(35, 95),
    views,
    gmv: orders * randInt(70000, 130000),
    orders,
    avgWatchTimeSec: randInt(45, 240),
  };
}).sort((a, b) => (a.startTime < b.startTime ? 1 : -1));

export const MOCK_VIDEOS: ShopeeVideo[] = Array.from({ length: 10 }, (_, i) => {
  const views = randInt(900, 54000);
  const orders = round0(views * (0.002 + rng() * 0.006));
  return {
    videoId: `vid-${i + 1}`,
    title: pick([
      "Rutinitas skincare pagi ✨ Glow Bomb Serum",
      "Review jujur: Coral Glow Sunscreen SPF50",
      "GRWM pakai produk Glow FX doang!",
      "Sunscreen apa yg gak bikin whitecast?",
      "Unboxing Glow FX Bestseller Bundle",
    ]),
    publishTime: isoDatetimeAgo(randInt(12, RANGE_DAYS * 24)),
    views,
    likes: round0(views * (0.03 + rng() * 0.05)),
    gmv: orders * randInt(60000, 120000),
    orders,
  };
}).sort((a, b) => b.views - a.views);
