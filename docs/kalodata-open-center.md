# KaloData Open Center — API Reference (Glow FX)

> Sumber: screenshot docs `kalodata.com/open-center/docs` (dibaca via vision, 2026-08-13).
> 12 endpoint TikTok e-commerce market data. Auth: secret-key di header.

## Base & Auth

- **Base URL:** `https://www.kalodata.com/openapi/v1`
- **Method:** semua endpoint pakai **HTTP POST + JSON** (rank & detail); credit-balance/utility pakai GET
- **Auth (KONFIRMASI live test 2026-08-13):** header **`x-api-key: <secret-key>`**. Bukan Bearer.
- **Onboarding:** (1) Account → create/manage API key, (2) Pricing → lihat pricing, (3) integrate

### Status kredensial (2026-08-13)
- Key tersimpan di `.env.local` sebagai `KALODATA_API_KEY`.
- **Key valid & terbaca**, tapi **credit balance = 0** → semua endpoint return `code 2016 "Insufficient credit balance"`. Perlu top-up dulu.
- Request body yang terkonfirmasi ke-parse benar: `{"region":"ID","language":"id-ID","currency":"IDR","date_range":"last7Day","page":1,"page_size":5}`.

## Common Fields (semua endpoint)

| Field | Type | Deskripsi |
|---|---|---|
| region | string | Country code: US, BR, MX, **ID**, JP, MY, PH, SG, TH, VN, GB, ES, DE, FR, IT |
| language | string | zh-CN, en-US, **id-ID**, th-TH, vi-VN, es-ES, ja-JP, pt-BR, ko-KR, fr-FR |
| currency | string | CNY, USD, **IDR**, VND, THB, MYR, JPY, PHP, GBP, SGD, MXN, EUR, BRL |
| date_range | string | lastDay / last7Day / last30Day / last60Day / last90Day / last180Day / last365Day, ATAU `yyyy-MM-dd~yyyy-MM-dd`, ATAU bulan `yyyy-MM`. **Rank endpoints cap 30 hari** |

## Rate Limit

- **Detail endpoints** (video/shop/product/livestream/creator/category `detail`): **100 req / 10 detik**
- **Rank endpoints** (`rank`): **10 req / 10 detik**

## Response envelope (semua)

```json
{ "success": bool, "data": {...} | [...], "message": "...", "debug": {...}, "cached": bool, "code": "...", "errorCategory": "BUSINESS" | "VALIDATION" | ... }
```

**Error codes (terkonfirmasi):**
- `2016` + `errorCategory=BUSINESS` → Insufficient credit balance (top-up)
- `501` + `errorCategory=VALIDATION` → "The key is not null or empty" (key nggak ke-send di header yang bener)

---

## 12 Endpoint

### tiktok/video
| Endpoint | Path | Note |
|---|---|---|
| Get video details | `POST /openapi/v1/tiktok/video/detail` | param: video_id, need_extra |
| Get video ranking list | `POST /openapi/v1/tiktok/video/rank` | sort: revenue(default)/views/revenue_growth_rate/ads_roas; filter: category_ids, shop_id, creator_id, product_id, revenue_range, followers_range, ads_roas, keyword, is_ai_video |

**Video fields:** video_id, video_title, belonged_creator_id, belonged_creator_handle, revenue, sales_volumn, views, video_gpm (revenue/1000 views), ads_views, ads_roas, ads_period, digg_count, share_count, comment_count, ad_cpa, ad_revenue_ratio, ad_view_ratio, revenue_trend[], duration, ad (1=ad/0=organic), ai_video

### tiktok/shop
| Endpoint | Path | Note |
|---|---|---|
| Get shop details | `POST /openapi/v1/tiktok/shop/detail` | param: shop_id, category_ids, need_extra |
| Get shop ranking list | `POST /openapi/v1/tiktok/shop/rank` | sort: revenue/unit_price/affiliate_revenue/self_promotion_revenue/shopping_mall_revenue; filter: category_ids, revenue_range, shop_type, keyword, unit_price_range |

**Shop fields:** shop_id, shop_name, region, revenue, shoppingmall_revenue, self_account_revenue, affiliate_revenue, sales_volumn, unit_price, creator_number, product_number, video_number, live_number, revenue_trend[], top3_product_ids[], seller_type (BRAND/RETAILER)

### tiktok/product
| Endpoint | Path | Note |
|---|---|---|
| Get product details | `POST /openapi/v1/tiktok/product/detail` | param: product_id, need_image, need_extra |
| Get product ranking list | `POST /openapi/v1/tiktok/product/rank` | sort: revenue/commission_rate/revenue_growth_rate/sales/unit_price/launch_date/live_revenue/video_revenue; filter: category_ids, shop_id, creator_id, video_id, livestream_id, revenue_range, is_affiliate, commission_rate, is_tts_product, unit_price_range, delivery_type, launch_date, keyword |

**Product fields:** product_id, product_name, product_shop_id, pri/sec/ter_cate_id, max_price, min_price, revenue, video_revenue, live_revenue, showcase_revenue, sales_volumn, creator_number, video_number, live_number, delivery_type (local/global), shopping_mall_revenue, commission_rate, unit_price, product_review_count, launch_date, master_image_url, revenue_trend[], seller_id, seller_name, sku_count

### tiktok/livestream
| Endpoint | Path | Note |
|---|---|---|
| Get livestream details | `POST /openapi/v1/tiktok/livestream/detail` | param: livestream_id, need_extra |
| Get livestream ranking list | `POST /openapi/v1/tiktok/livestream/rank` | sort: revenue/unit_price/views/duration/start_time; filter: category_ids, shop_id, creator_id, product_id, followers_range, keyword |

**Livestream fields:** livestream_id, livestream_title, creator_handle, creator_id, livestream_start_time/end_time (ms), livestream_duration (detik), product_number, viewers, revenue, gpm, top3_product_ids[], record_type, unit_price, views

### tiktok/creator
| Endpoint | Path | Note |
|---|---|---|
| Get creator details | `POST /openapi/v1/tiktok/creator/detail` | param: creator_id, category_ids, shop_id, need_extra |
| Get creator ranking list | `POST /openapi/v1/tiktok/creator/rank` | sort: revenue/revenue_growth_rate/content_views/creator_followers/sales/video_revenue/live_revenue; filter: category_id_list, shop_id, product_id, revenue_range, creator_type (BELONGED_TO_SELLER/INDEPENDENT), followers_range, engagement_rate (LOW<8%/MEDIUM 8-20%/HIGH>20%), keyword, need_image, need_category |

**Creator fields:** creator_id, creator_nickname, creator_handle, creator_region, creator_status (INDEPENDENT/BELONGED_TO_SELLER), creator_bio, revenue, revenue_growth_rate, content_views, creator_followers, sales_column, video_revenue, live_revenue, category_list[], category_id_list[], ter_category_list[], ter_category_id_list[]

### tiktok/category
| Endpoint | Path | Note |
|---|---|---|
| Get category details | `POST /openapi/v1/tiktok/category/detail` | param: category_id; date_range HANYA named (last7Day/30/90/180/365) |
| Get category ranking list | `POST /openapi/v1/tiktok/category/rank` | sort: revenue/revenue_growth_rate/top3_shop_revenue_ratio/average_revenue; filter: category_ids, category_level (1/2/3), revenue_range |

**Category fields:** category_id, category_name, rank, revenue, sale, revenue_growth_rate, top3_shop_revenue_ratio, average_revenue, shop_number, live_revenue, video_revenue, average_shop_revenue, affiliate_revenue, self_operate_revenue, shopping_mall_revenue, revenue_trend[], active_product_number

---

## Kenapa ini GAME CHANGER buat Glow FX

1. **Region ID + currency IDR + language id-ID** — data Indonesia, bukan cuma US (beda dari ScrapeCreators Shop yang US-only).
2. **Creator data lengkap** — nutup gap 40% di KOL dashboard (yang selama ini collab/sample/chat internal doang yang kurang; creator discovery & performa bisa real dari sini).
3. **Shop detail + rank** — kompetitor spy (Hanasui): revenue, produk top3, creator structure, affiliate vs self revenue.
4. **Product rank** — product selection: cari SKU laku di Beauty ID, filter harga + komisi.
5. **ads_roas / ads_views / ad** — KaloData expose data *paid ads* (ROAS video iklan), yang bikin bisa benchmark konten iklan kompetitor.
6. **Category** — market size & growth per kategori.

## Catatan

- Rank endpoints rate limit ketat (10 req/10s) → perlu pagination hati-hati + cache.
- `need_image=2` (kalo_data image URL) = **paid service**; `need_image=1` = official URL (gratis).
- `cached` boolean di response = ada cache; cek pricing buat detail biaya per-request.
- Nama field kadang typo di docs: `sales_volumn` (bukan volume), `sales_column` (di product/creator rank). Ikutin persis nama field di response.
