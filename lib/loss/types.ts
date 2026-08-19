// Types for the Loss Analysis dashboard. Every field maps 1:1 to the TikTok
// Shop Seller API endpoint:
//   POST /return_refund/202602/cancellations/search
//   (scope: seller.return_refund.basic)
//
// Response shape: data.cancellations[] with the fields below. Note: refund
// amounts come back as strings ("1.23") from the API — the sync layer parses
// them with Number() before storing; this type keeps them as number for the UI.

export type CancelType = "CANCEL" | "BUYER_CANCEL";
// CANCEL = cancel by seller or system
// BUYER_CANCEL = cancel by buyer (needs seller/system approval)

export type CancelStatus =
  | "CANCELLATION_REQUEST_PENDING"
  | "CANCELLATION_REQUEST_SUCCESS"
  | "CANCELLATION_REQUEST_CANCELLED"
  | "CANCELLATION_REQUEST_COMPLETE";

export type CancelRole = "BUYER" | "SELLER" | "SYSTEM";

export interface RefundAmount {
  currency: string;
  refundTotal: number; // refund_total
  refundSubtotal: number; // refund_subtotal
  refundShippingFee: number; // refund_shipping_fee
  refundTax: number; // refund_tax
}

export interface SellerNextAction {
  action: string; // e.g. "SELLER_RESPOND_CANCEL"
  deadline: number; // unix timestamp (seconds)
}

export interface CancelLineItem {
  cancelLineItemId: string;
  orderLineItemId: string;
  skuId: string;
  skuName: string;
  productName: string;
  sellerSku: string;
  refundAmount: RefundAmount;
}

export interface Cancellation {
  brand: string;
  cancelId: string; // cancel_id
  orderId: string; // order_id
  cancelType: CancelType;
  cancelStatus: CancelStatus;
  role: CancelRole;
  cancelReason: string; // machine-readable reason key
  cancelReasonText: string; // localized reason text
  createTime: number; // unix timestamp
  updateTime: number;
  sellerNextAction: SellerNextAction | null; // present for BUYER_CANCEL pending seller respond
  refundAmount: RefundAmount;
  lineItems: CancelLineItem[];
  shouldReplenishStock: boolean;
}
