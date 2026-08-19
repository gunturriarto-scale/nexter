// Shared types for the Shopee dashboard, modeled on fields available across
// the Shopee Open Platform v2 API — see docs/shopee-open-api.md for the full
// endpoint catalog (Order, Product, Returns, AMS/Ads, AccountHealth, Live, Video).

export type OrderStatus =
  | "UNPAID"
  | "PENDING"
  | "READY_TO_SHIP"
  | "PROCESSED"
  | "SHIPPED"
  | "TO_CONFIRM_RECEIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "TO_RETURN";

export type ReturnStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "CANCELLED"
  | "JUDGING"
  | "CLOSED"
  | "PROCESSING"
  | "SELLER_DISPUTE";

export type ReturnReason =
  | "NONRECEIPT"
  | "WRONG_ITEM"
  | "ITEM_DAMAGED"
  | "DIFF_DESC"
  | "CHANGE_MIND"
  | "ITEM_FAKE"
  | "EXPIRED_PRODUCT";

export type ProductStatus = "NORMAL" | "BANNED" | "UNLIST" | "DELETED";

export interface ShopeeOrderItem {
  itemId: string;
  modelId: string;
  itemName: string;
  modelName: string;
  quantityPurchased: number;
  itemPrice: number;
  discountedPrice: number;
}

export interface ShopeeOrder {
  orderSn: string;
  shopId: string;
  orderStatus: OrderStatus;
  createTime: string; // ISO
  payTime: string | null;
  shipByDate: string | null; // ISO
  totalAmount: number;
  currency: "IDR";
  buyerUsername: string;
  items: ShopeeOrderItem[];
  cancelReason: "OUT_OF_STOCK" | "UNDELIVERABLE_AREA" | null;
  shippingCarrier: string;
  actualShippingFee: number;
  escrowAmount: number | null;
  escrowReleased: boolean;
  firstMileBound: boolean;
}

export interface ShopeeReturn {
  returnSn: string;
  orderSn: string;
  shopId: string;
  status: ReturnStatus;
  reason: ReturnReason;
  refundAmount: number;
  createTime: string;
  updateTime: string;
}

export interface ShopeeProductModel {
  modelId: string;
  modelName: string;
  modelSku: string;
  price: number;
  stock: number;
}

export interface ShopeeProduct {
  itemId: string;
  shopId: string;
  itemName: string;
  itemSku: string;
  categoryName: string;
  price: number;
  stock: number;
  status: ProductStatus;
  views: number;
  likes: number;
  unitsSold: number;
  revenue: number;
  ratingStar: number;
  imageSeed: string;
  models: ShopeeProductModel[];
}

export type AdType = "PRODUCT" | "SHOP" | "KEYWORD";
export type AdCampaignStatus = "ONGOING" | "PAUSED" | "ENDED" | "SCHEDULED";

export interface ShopeeAdsDaily {
  day: string; // YYYY-MM-DD
  campaignId: string;
  campaignName: string;
  adType: AdType;
  status: AdCampaignStatus;
  cost: number;
  gmv: number;
  impressions: number;
  clicks: number;
  directOrders: number;
  broadOrders: number;
}

export interface ShopeeAffiliatePerformance {
  affiliateId: string;
  affiliateName: string;
  clicks: number;
  orders: number;
  gmv: number;
  commission: number;
}

export interface ShopeeContentPerformance {
  contentId: string;
  title: string;
  contentType: "VIDEO" | "LIVE" | "POST";
  clicks: number;
  orders: number;
  gmv: number;
}

export interface ShopeeAccountHealthDay {
  day: string;
  penaltyPoints: number;
  lateOrderRate: number; // %
  nonFulfillmentRate: number; // %
  listingViolationCount: number;
  responseRate: number; // %
}

export interface ShopeeLivestreamSession {
  sessionId: string;
  title: string;
  startTime: string;
  durationMin: number;
  views: number;
  gmv: number;
  orders: number;
  avgWatchTimeSec: number;
}

export interface ShopeeVideo {
  videoId: string;
  title: string;
  publishTime: string;
  views: number;
  likes: number;
  gmv: number;
  orders: number;
}

export interface ShopeeShop {
  shopId: string;
  shopName: string;
  brand: string;
  region: string;
}
