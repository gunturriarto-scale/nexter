// Types for the Market Intelligence dashboard. Every field maps 1:1 to the
// KaloData Open Center API (see docs/kalodata-open-center.md):
//   POST /openapi/v1/tiktok/shop/rank      (brand ranking)
//   POST /openapi/v1/tiktok/shop/detail    (revenue mix, trend, creator count)
//   POST /openapi/v1/tiktok/product/rank   (top products per category)
//
// Region = ID, currency = IDR, language = id-ID. Field names follow the API
// response exactly (note KaloData's `sales_volumn` / `sales_column` typos —
// kept verbatim so the swap to real data needs no renaming).

export type SellerType = "BRAND" | "RETAILER";
export type DeliveryType = "local" | "global";

export interface RevenueTrendPoint {
  day: string; // YYYY-MM-DD
  revenue: number;
}

/** One shop/brand row (from shop/rank + shop/detail). */
export interface Shop {
  shopId: string;
  shopName: string;
  region: string;
  sellerType: SellerType;
  revenue: number;
  salesVolumn: number;
  unitPrice: number;
  revenueGrowthRate: number; // percent
  shoppingMallRevenue: number;
  selfAccountRevenue: number;
  affiliateRevenue: number;
  creatorNumber: number;
  productNumber: number;
  videoNumber: number;
  liveNumber: number;
  revenueTrend: RevenueTrendPoint[];
  top3ProductIds: string[];
  /**
   * Derived: sum of top-3 product revenue ÷ total shop revenue (percent).
   * Computed by joining shop/detail `top3_product_ids` with product/detail.
   */
  top3RevenueShare: number;
}

/** One product row (from product/rank). */
export interface Product {
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  revenue: number;
  revenueGrowthRate: number; // percent
  unitPrice: number;
  salesVolumn: number;
  videoRevenue: number;
  liveRevenue: number;
  showcaseRevenue: number;
  commissionRate: number; // percent
  creatorNumber: number;
  videoNumber: number;
  liveNumber: number;
  productReviewCount: number;
  launchDate: string; // YYYY-MM-DD
  deliveryType: DeliveryType;
  /** Benefit/category tag (e.g. "Serum", "Sunscreen") — for whitespace & portfolio analysis. */
  categoryTag: string;
}

/** Category-level market data (from category/rank + category/detail). */
export interface MarketCategory {
  categoryId: string;
  categoryName: string;
  region: string;
  revenue: number; // total category GMV (market size)
  revenueGrowthRate: number; // percent, category growth
  sale: number;
  top3ShopRevenueRatio: number; // percent held by top-3 shops (concentration)
  shopNumber: number;
  averageShopRevenue: number;
  liveRevenue: number;
  videoRevenue: number;
  affiliateRevenue: number;
  selfOperateRevenue: number;
  shoppingMallRevenue: number;
  activeProductNumber: number;
}
