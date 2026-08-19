# Shopee Open Platform — API Reference (Glow FX)

> Sumber: https://open.shopee.com/developer-guide/4 + internal API
> `opservice/api/v1/developer_guide/detail?document_id=N` (dibaca penuh 2026-08-13).
> Source API ke-5. Baca sampai tuntas: Introduction (4), Developer registration (12), App mgmt (14),
> API calls (16), Authorization (20), V2.0 Call Flow (27), V2.0 Data Definition (31).

## Overview

Shopee Open Platform = API buat **seller/developer** akses data & kelola shop sendiri di Shopee.
Data **internal shop Glow FX di Shopee** (bukan kompetitor/market). Tersedia semua market (ID termasuk).

## 3 tipe akun developer

| Tipe | Bisa service | Relevan buat Glow FX |
|---|---|---|
| Individual Seller | Cuma shop sendiri | ✅ (kalau Glow FX individual) |
| Registered Business Seller | Cuma shop sendiri | ✅ (kalau punya badan usaha) |
| Third-party Partner (ISV) | Service seller lain | ❌ (bukan kasus kita) |

**Eligibility market ID:** Mall Seller ATAU Managed Seller ATAU **≥30 order dalam 30 hari terakhir**.

## 7 tipe App (yang bisa dibuat)

ERP System, Product Management, Order Management, Accounting/Finance, **Marketing**, **Seller In-house System**, Customer Service.

Untuk Glow FX (seller pakai sendiri) → **Seller In-house System** (atau Marketing). Individual seller cuma bisa Product Management + Marketing. **Business Seller** bisa lebih banyak.

## Auth Flow (OAuth 2.0) — FULL

1. **Daftar developer** → approval (Seller 3 hari kerja, ISV 10 hari)
2. **Buat App** → dapet `partner_id` + `partner_key`
3. **Generate authorization link** (harus ada `sign`, timestamp valid 5 menit):
   `https://open.shopee.com/auth?partner_id=X&auth_type=seller&redirect_uri=Y&response_type=code`
4. **Seller authorize** → pilih durasi validitas (7/30/90/180/365 hari)
5. **Redirect balik** bawa `?code=xxx&shop_id=xxx` (code valid 1x, expire 10 menit)
6. **Tuker code → token**: `POST https://partner.shopeemobile.com/api/v2/auth/token/get` (body: code, shop_id, partner_id)
   - Response: `access_token` (4 jam), `refresh_token` (30 hari), `expire_in`, `shop_id`, `merchant_id`
7. **Refresh**: `POST /api/v2/auth/refresh_token/get` (pakai refresh_token sebelum expired)

## API Call — 3 tipe + SIGN (HMAC-SHA256)

**3 domain production** (pilih sesuai lokasi server):
- `https://partner.shopeemobile.com/` (SG — paling deket buat kita)
- `https://openplatform.shopee.cn/` (China mainland)
- `https://openplatform.shopee.com.br/` (US)

**Sandbox:** `https://openplatform.sandbox.test-stable.shopee.sg/`

**3 tipe API (beda common params):**

| Tipe | Common params |
|---|---|
| **Shop API** | partner_id, timestamp, sign, access_token, shop_id |
| **Merchant API** | partner_id, timestamp, sign, access_token, merchant_id |
| **Public API** | partner_id, timestamp, sign (NO access_token) |

**Sign calculation (WAJIB tiap request):**
```
base_string = partner_id + api_path + timestamp [+ access_token + shop_id]  (urutan ketat!)
sign = HMAC-SHA256(partner_key, base_string).hexdigest()  (hex lowercase)
```
- timestamp valid 5 menit
- Public API: `partner_id + path + timestamp`
- Shop API: `partner_id + path + timestamp + access_token + shop_id`
- Merchant API: `partner_id + path + timestamp + access_token + merchant_id`

**Method:** GET & POST (HTTP/JSON, beberapa HTTP/FORM untuk upload).

## Kategori API (relevan Glow FX)

### 🎯 AMS (Shopee Ads) — paralel GMV Max TikTok
`get_shop_performance`, `get_product_performance`, `get_affiliate_performance`, `get_content_performance`, `get_campaign_key_metrics_performance`, `get_open_campaign_performance`, `get_targeted_campaign_performance`, `get_conversion_report`, `get_recommended_affiliate_list`, `get_shop_suggested_rate`, `batch_get_products_suggested_rate`

### 🎬 Shopee Video
`get_video_list`, `get_video_detail`, `get_overview_performance`, `get_metric_trend`, `get_video_performance_list`, `get_video_detail_performance`, `post_video`, `edit_video_info`, `delete_video`

### 📺 Livestream
`create_session`, `start_session`, `end_session`, `get_session_detail`, item management

### 🛍️ Product
`get_item_list`, `get_item_base_info`, `get_item_extra_info`, `get_comment`, `reply_comment`, `get_model_list`, `update_stock`, `update_price`

### 📦 Order
`get_order_list`, `get_order_detail`, `get_shipment_list`, `cancel_order`, `handle_buyer_cancellation`

### ↩️ Returns
`get_return_list`, `get_return_detail`, `confirm`, `dispute`, `get_available_solutions`, `offer`, `accept_offer`

### 💰 Payment
`get_income_overview`, `get_income_detail`, `get_payout_detail`, `get_escrow_detail`, `get_income_report`

### 🏥 AccountHealth
`get_shop_performance`, `get_penalty_point_history`, `get_listings_with_issues`, `get_late_orders`

### 🏪 Shop
`get_shop_info`, `get_profile`, `get_shop_notification`

### 📢 Promosi
Discount (`add_discount`, `get_discount_list`), Bundle Deal, Add-On Deal

## Data Definition penting (V2.0)

**OrderStatus:** UNPAID → PENDING → READY_TO_SHIP → PROCESSED → SHIPPED → TO_CONFIRM_RECEIVE → COMPLETED / CANCELLED / TO_RETURN

**ReturnStatus:** REQUESTED, ACCEPTED, CANCELLED, JUDGING, CLOSED, PROCESSING, SELLER_DISPUTE

**ReturnReason:** NONRECEIPT, WRONG_ITEM, ITEM_DAMAGED, DIFF_DESC, CHANGE_MIND, ITEM_FAKE, EXPIRED_PRODUCT, dll

**CancelReason (seller):** OUT_OF_STOCK, UNDELIVERABLE_AREA

## Kenapa penting buat Glow FX

1. **Data Shopee internal** — channel marketplace yang belum ke-cover (selama ini fokus TikTok).
2. **AMS performance** = paralel GMV Max (cost/GMV/ROI iklan Shopee).
3. **Order + Returns + Payment** = revenue & loss Shopee.
4. **Video + Live Shopee** = konten & live performa.
5. **Affiliate performance** = KOL/affiliate Shopee.

## Checklist go-live (buat nanti di-unpark)

- [ ] Daftar developer account (Seller type sesuai badan usaha Glow FX) — approval 3 hari
- [ ] Buat App "Seller In-house System" → dapet partner_id + partner_key
- [ ] Set Redirect URL Domain di Console
- [ ] Generate auth link → authorize shop Glow FX → dapet code + shop_id
- [ ] Tukar code → access_token + refresh_token → simpan ke Supabase (terpisah per shop_id)
- [ ] Bikin HMAC-SHA256 sign helper + auto-refresh token job
- [ ] Sync route: AMS performance + order + returns + payment
- [ ] Halaman /shopee
