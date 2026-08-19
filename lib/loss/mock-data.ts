import { Cancellation } from "@/lib/loss/types";

/**
 * Mock dataset for the Loss Analysis dashboard. Every field mirrors the
 * TikTok Shop Seller API `search-cancellations` response 1:1 (see types.ts).
 * Swap this module for a real Supabase-backed query once Seller API
 * credentials are wired in — no field renaming needed.
 *
 * Single brand: Glow FX Beauty. Deterministic (fixed) values so the mock is
 * stable across renders.
 */

function hoursFromNow(hours: number): number {
  return Math.floor(Date.now() / 1000) + hours * 3600;
}

function daysAgoUnix(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 86400;
}

export const MOCK_BRANDS = ["Glow FX"];

export const MOCK_CANCELLATIONS: Cancellation[] = [
  {
    brand: "Glow FX",
    cancelId: "cnl-9001",
    orderId: "577087614418520388",
    cancelType: "BUYER_CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_PENDING",
    role: "BUYER",
    cancelReason: "ecom_order_to_ship_canceled_reason_created_by_mistakes",
    cancelReasonText: "Order created by mistake",
    createTime: daysAgoUnix(1),
    updateTime: daysAgoUnix(1),
    sellerNextAction: { action: "SELLER_RESPOND_CANCEL", deadline: hoursFromNow(6) },
    refundAmount: {
      currency: "USD",
      refundTotal: 32.0,
      refundSubtotal: 30.5,
      refundShippingFee: 1.5,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9001-1",
        orderLineItemId: "576468844534141348",
        skuId: "2729382476852921560",
        skuName: "20ml",
        productName: "GLOW fx BEAUTY Glow Bomb Serum 20ml",
        sellerSku: "GF-GB-20",
        refundAmount: {
          currency: "USD",
          refundTotal: 32.0,
          refundSubtotal: 30.5,
          refundShippingFee: 1.5,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: false,
  },
  {
    brand: "Glow FX",
    cancelId: "cnl-9002",
    orderId: "577087614418520389",
    cancelType: "BUYER_CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_PENDING",
    role: "BUYER",
    cancelReason: "ecom_order_to_ship_canceled_reason_delay_shipping",
    cancelReasonText: "Shipping takes too long",
    createTime: daysAgoUnix(0),
    updateTime: daysAgoUnix(0),
    sellerNextAction: { action: "SELLER_RESPOND_CANCEL", deadline: hoursFromNow(20) },
    refundAmount: {
      currency: "USD",
      refundTotal: 38.0,
      refundSubtotal: 36.0,
      refundShippingFee: 2.0,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9002-1",
        orderLineItemId: "576468844534141349",
        skuId: "2729382476852921561",
        skuName: "20mL",
        productName: "GLOW fx BEAUTY Acne Pure Serum 20mL",
        sellerSku: "GF-AP-20",
        refundAmount: {
          currency: "USD",
          refundTotal: 38.0,
          refundSubtotal: 36.0,
          refundShippingFee: 2.0,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: false,
  },
  {
    brand: "Glow FX",
    cancelId: "cnl-9003",
    orderId: "577087614418520390",
    cancelType: "CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_SUCCESS",
    role: "SYSTEM",
    cancelReason: "ecom_order_to_ship_canceled_reason_out_of_stock",
    cancelReasonText: "Out of stock",
    createTime: daysAgoUnix(3),
    updateTime: daysAgoUnix(3),
    sellerNextAction: null,
    refundAmount: {
      currency: "USD",
      refundTotal: 30.0,
      refundSubtotal: 29.0,
      refundShippingFee: 1.0,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9003-1",
        orderLineItemId: "576468844534141350",
        skuId: "2729382476852921562",
        skuName: "20ml",
        productName: "GLOW fx BEAUTY 17% Total Acids Peeling Serum",
        sellerSku: "GF-PL-20",
        refundAmount: {
          currency: "USD",
          refundTotal: 30.0,
          refundSubtotal: 29.0,
          refundShippingFee: 1.0,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: true,
  },
  {
    brand: "Glow FX",
    cancelId: "cnl-9004",
    orderId: "577087614418520391",
    cancelType: "BUYER_CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_COMPLETE",
    role: "BUYER",
    cancelReason: "ecom_order_to_ship_canceled_reason_changed_mind",
    cancelReasonText: "Changed mind",
    createTime: daysAgoUnix(6),
    updateTime: daysAgoUnix(5),
    sellerNextAction: null,
    refundAmount: {
      currency: "USD",
      refundTotal: 22.0,
      refundSubtotal: 21.0,
      refundShippingFee: 1.0,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9004-1",
        orderLineItemId: "576468844534141351",
        skuId: "2729382476852921563",
        skuName: "150ml",
        productName: "GLOW fx BEAUTY Glow Bomb Rice Toner",
        sellerSku: "GF-RT-150",
        refundAmount: {
          currency: "USD",
          refundTotal: 22.0,
          refundSubtotal: 21.0,
          refundShippingFee: 1.0,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: false,
  },
  {
    brand: "Glow FX",
    cancelId: "cnl-9005",
    orderId: "577087614418520392",
    cancelType: "BUYER_CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_CANCELLED",
    role: "SELLER",
    cancelReason: "ecom_order_to_ship_canceled_reason_duplicate_order",
    cancelReasonText: "Duplicate order",
    createTime: daysAgoUnix(4),
    updateTime: daysAgoUnix(3),
    sellerNextAction: null,
    refundAmount: {
      currency: "USD",
      refundTotal: 32.0,
      refundSubtotal: 30.5,
      refundShippingFee: 1.5,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9005-1",
        orderLineItemId: "576468844534141352",
        skuId: "2729382476852921560",
        skuName: "20ml",
        productName: "GLOW fx BEAUTY Glow Bomb Serum 20ml",
        sellerSku: "GF-GB-20",
        refundAmount: {
          currency: "USD",
          refundTotal: 32.0,
          refundSubtotal: 30.5,
          refundShippingFee: 1.5,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: false,
  },
  {
    brand: "Glow FX",
    cancelId: "cnl-9006",
    orderId: "577087614418520393",
    cancelType: "BUYER_CANCEL",
    cancelStatus: "CANCELLATION_REQUEST_PENDING",
    role: "BUYER",
    cancelReason: "ecom_order_to_ship_canceled_reason_wrong_variant",
    cancelReasonText: "Wrong variant selected",
    createTime: daysAgoUnix(0),
    updateTime: daysAgoUnix(0),
    sellerNextAction: { action: "SELLER_RESPOND_CANCEL", deadline: hoursFromNow(3) },
    refundAmount: {
      currency: "USD",
      refundTotal: 64.0,
      refundSubtotal: 62.0,
      refundShippingFee: 2.0,
      refundTax: 0,
    },
    lineItems: [
      {
        cancelLineItemId: "li-9006-1",
        orderLineItemId: "576468844534141353",
        skuId: "2729382476852921564",
        skuName: "50ml",
        productName: "GLOW fx BEAUTY Brightening & Barrier Repair Moisturizer",
        sellerSku: "GF-MO-50",
        refundAmount: {
          currency: "USD",
          refundTotal: 64.0,
          refundSubtotal: 62.0,
          refundShippingFee: 2.0,
          refundTax: 0,
        },
      },
    ],
    shouldReplenishStock: false,
  },
];
