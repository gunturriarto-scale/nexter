# TikTok Commerce API — Master Reference (Glow FX)

> Sumber: TikTok Shop Partner Center (docv2), TikTok Business API (portal/docs), Scrape Creators (docs.scrapecreators.com)
> Di-compile: 2026-08-12. Selalu cross-check ke doc asli sebelum implementasi.

---

## 1. TIKTOK SHOP PARTNER CENTER (Seller API) — Search Cancellations

**URL doc:** https://partner.tiktokshop.com/docv2/page/search-cancellations-202602
**Path:** `POST /return_refund/202602/cancellations/search`
**Scope required:** `seller.return_refund.basic`
**Base:** `https://open-api.tiktokglobalshop.com`

### Fungsi
Search & retrieve satu atau lebih order cancellations (pembatalan order).

### Common Parameters
| Prop | Loc | Type | Req | Desc |
|---|---|---|---|---|
| shop_cipher | query | string | Y | Shop info (cross-border wajib) |
| content-type | header | string | Y | `application/json` |
| x-tts-access-token | header | string | Y | Seller access_token (user_type=0) |
| app_key | query | string | Y | Unique app key |
| sign | query | string | Y | HMAC signature |
| timestamp | query | int | Y | Unix timestamp UTC |

### Query Params
| Prop | Type | Req | Desc |
|---|---|---|---|
| sort_field | string | N | `create_time` (default) / `update_time` |
| sort_order | string | N | `ASC` (default) / `DESC` |
| page_size | string | N | Default 10, range 1-50 |
| page_token | string | N | Opaque pagination token |

### Request Body
| Prop | Type | Req | Desc |
|---|---|---|---|
| cancel_ids | []string | N | List cancellation IDs |
| order_ids | []string | N | List TikTok Shop order IDs |
| buyer_user_ids | []string | N | List buyer user IDs |
| cancel_types | []string | N | `CANCEL` (by seller/system) / `BUYER_CANCEL` (by buyer) |
| cancel_status | []string | N | `CANCELLATION_REQUEST_PENDING` / `_SUCCESS` / `_CANCEL` / `_COMPLETE` |
| create_time_ge / lt | int | N | Unix timestamp filter |
| update_time_ge / lt | int | N | Unix timestamp filter |
| locale | string | N | BCP-47, default en-US |

### Response (data.cancellations[])
- `order_id`, `cancel_type`, `cancel_status`, `role` (BUYER/SELLER/SYSTEM)
- `cancel_reason`, `cancel_reason_text` (localized)
- `create_time`, `update_time`
- `seller_next_action_response[]` → `action` (`SELLER_RESPOND_CANCEL`), `deadline`
- `refund_amount` → currency, refund_total, refund_subtotal, refund_shipping_fee, refund_tax, retail_delivery_fee, buyer_service_fee
- `cancel_line_items[]` → cancel_line_item_id, order_line_item_id, sku_id, sku_name, product_image{url}, product_name, seller_sku, refund_amount; `cancel_sub_line_items[]` (virtual bundle SKUs)
- `cancel_id`, `should_replenish_stock`
- Top: `total_count`, `next_page_token`

### Error Codes
25001001 invalid param · 25020005 no permission · 25020008 / 36009003 internal error

---

## 2. TIKTOK BUSINESS API — GMV Max Campaigns

### 2.1 Get GMV Max Campaigns
**Path:** `GET https://business-api.tiktok.com/open_api/v1.3/gmv_max/campaign/get/`
**Header:** `Access-Token` (required)
**Base:** `https://business-api.tiktok.com`

#### Params
| Field | Type | Req | Desc |
|---|---|---|---|
| advertiser_id | string | Y | Advertiser ID |
| fields | string[] | N | Response fields yang mau diambil |
| filtering.gmv_max_promotion_types | string[] | Y | `PRODUCT_GMV_MAX` / `LIVE_GMV_MAX` |
| filtering.store_ids | string[] | N | Max 10; cek `/gmv_max/store/list/` utk is_gmv_max_available |
| campaign_ids | string[] | N | Max 100 |
| campaign_name | string | N | Name filter |
| primary_status | string | N | `STATUS_DELIVERY_OK` / `STATUS_DISABLE` / `STATUS_DELETE` |
| creation_filter_start_time / end_time | string | N | `YYYY-MM-DD HH:MM:SS` UTC; saran ≤6 bulan |
| page | int | N | ≥1, default 1 |
| page_size | int | N | 1-100, default 10 |

#### Response (data.list[])
- advertiser_id, campaign_id, campaign_name
- operation_status (`ENABLE`/`DISABLE`)
- create_time, modify_time
- objective_type (`PRODUCT_SALES`)
- secondary_status (lihat Supported campaign secondary statuses)
- roi_protection_compensation_status → `IN_EFFECT` / `NOT_ELIGIBLE`
  - IN_EFFECT: eligible ad credit kalau >20 conversions/24h tapi ROI <90% target
  - NOT_ELIGIBLE: ROI diedit / campaign paused / max delivery / masalah shop
- page_info: page, page_size, total_number, total_page

### 2.2 Get the details of a GMV Max Campaign
**Path:** `GET /open_api/v1.3/campaign/gmv_max/info/?advertiser_id=&campaign_id=`

#### Response (data)
- advertiser_id, operation_status, campaign_id, campaign_name
- store_id, store_authorized_bc_id
- shopping_ads_type: `PRODUCT` / `LIVE`
- product_specific_type: `ALL` / `CUSTOMIZED_PRODUCTS` / `UNSET`
- item_group_ids[] (SPU IDs, hanya kalau CUSTOMIZED_PRODUCTS)
- optimization_goal: `VALUE` (gross revenue)
- roi_protection_enabled (bool)
- deep_bid_type: `VO_MIN_ROAS` (Minimum ROAS)
- roas_bid (ROI target, kalau VO_MIN_ROAS)
- budget (daily budget)

#### promotion_days (object)
- is_enabled (bool)
- auto_schedule_enabled (bool)
- custom_schedule_list[] → start_time, end_time (`YYYY-MM-DD` ad account TZ)
- roas_bid_multiplier: `90` (-10%) / `80` (-20%) / `70` (-30%)
- adjusted_roas_bid (promotion days ROI target)
- budget_increase_percentage (e.g. 50 = +50%)
- increase_limit (max increases/day, e.g. 10)
- current_budget
- next_increase = current_budget × budget_increase_percentage
- remained_times
- maximum_budget = current_budget + current_budget × budget_increase_percentage × remained_times
- estimated_gross_revenue_increase (e.g. "24%")

#### auto_budget (object)
- auto_budget_enabled (bool) — non-promotion days
- budget_increase_percentage, increase_limit, current_budget, next_increase, remained_times, maximum_budget
- **Trigger:** achieved ROI ≥90% target & ≥80% budget terpakai → budget naik otomatis (max 10x/hari), reset tiap hari

#### Lainnya
- schedule_type: `SCHEDULE_FROM_NOW` / `SCHEDULE_START_END`
- schedule_start_time / end_time (UTC+0)
- placements: `PLACEMENT_TIKTOK` / `PLACEMENT_PANGLE` (Product GMV Max auto-explore TikTok+Pangle)
- location_ids[], age_groups[]
- product_video_specific_type: `AUTO_SELECTION` / `CUSTOM_SELECTION` / `UNSET`
- accelerate_testing_for_new_videos: `ON` / `OFF`
- identity_list[] → identity_id, identity_type (`AUTH_CODE`/`TT_USER`/`BC_AUTH_TT`/`TTS_TT`), identity_authorized_bc_id, identity_authorized_shop_id, store_id
- affiliate_posts_enabled (bool)
- item_list[] → item_id, text, spu_id_list, identity_info, profile_image (valid ~48h), user_name, video_info{video_id, video_cover_url (~24h), preview_url (~6h), height, width, bit_rate, duration, size, signature, format, definition, fps}
- campaign_custom_anchor_video_id / custom_anchor_video_list (to-be-deprecated → pakai `/gmv_max/creation/custom_anchor_video_list/get/`)

### 2.3 Run a GMV Max Campaign report
**Path:** `GET /open_api/v1.3/gmv_max/report/get/`
**Endpoint contoh:** `https://haapi.byteintl.net/open_api/v1.3/gmv_max/report/get/` (haapi host)

#### Rate limits
| Level | QPS | QPM | QPD |
|---|---|---|---|
| Basic | 8 | 240 | 20,000 |
| Advanced | 12 | 360 | 30,000 |
| Premium | 20 | 600 | 50,000 |
| Ultimate | 20 | 600 | 50,000 |

#### Params
| Field | Req | Desc |
|---|---|---|
| advertiser_id | Y | |
| store_ids | Y | Max 1 (!!) |
| start_date / end_date | Y | `YYYY-MM-DD` ad account TZ; ≤365 hari (tanpa time dim), ≤30 hari (stat_time_day), ≤1 hari (stat_time_hour) |
| metrics | Y | string[] |
| dimensions | Y | advertiser_id, campaign_id, stat_time_day, stat_time_hour, item_group_id, item_id, room_id, duration |
| enable_total_metrics | N | total data semua page |
| filtering.gmv_max_promotion_types | N | `PRODUCT` / `LIVE` |
| campaign_ids | N | max 100 |
| campaign_name | N | fuzzy |
| campaign_statuses | N | STATUS_DELIVERY_OK/DISABLE/DELETE/NOT_DELIVERY/ALL |
| item_group_ids | N | max 100 |
| creative_types (deprec) | N | ADS_AND_ORGANIC/ORGANIC/REMOVED |
| creative_delivery_statuses | N | IN_QUEUE, LEARNING, DELIVERING, NOT_DELIVERYING, AUTHORIZATION_NEEDED, EXCLUDED, UNAVAILABLE, REJECTED, NOT_ACTIVE |
| search_word | N | fuzzy (video title, post ID, account name) |
| room_ids | N | max 100 |
| sort_field / sort_type | N | ASC/DESC, default DESC |
| page / page_size | N | page_size 1-1000 |

#### Metrics lengkap (delivery)
- **Semua:** cost, orders (SKU), cost_per_order, gross_revenue, roi, net_cost
- **Product campaign-level:** + roas_bid (target ROI)
- **Product creative-level:** + creative_delivery_status, product_impressions, product_clicks, product_click_rate, ad_click_rate, ad_conversion_rate, ad_video_view_rate_2s, ad_video_view_rate_6s, ad_video_view_rate_p25, ad_video_view_rate_p50, ad_video_view_rate_p75, ad_video_view_rate_p100
- **LIVE campaign/livestream-level:** + live_views, cost_per_live_view, 10_second_live_views, cost_per_10_second_live_view, live_follows
- **Duration-level:** cost, orders, cost_per_order, gross_revenue, roi, (roas_bid product only)

#### Attribute metrics (non-performa)
- campaign_id, campaign_name, operation_status, schedule_type, schedule_start_time/end_time, target_roi_budget, bid_type, max_delivery_budget
- product_name, item_group_id, product_image_url
- title, item_id, tt_account_name, tt_account_profile_image_url, tt_account_authorization_type, shop_content_type
- LIVE: live_name, live_status, live_launched_time, live_duration

#### Notes
- Response default hanya campaign yang TIDAK di-delete
- Response shape: `data.list[]` → `dimensions{}` + `metrics{}`; semua nilai string
- gross_revenue = amount user pays + platform subsidies

### 2.4 Endpoint GMV Max lainnya (map)
- `POST /gmv_max/campaign/create/` — Create
- `POST /gmv_max/campaign/update/` — Update
- `GET /gmv_max/recommendation/get/` — recommended ROI target & budget
- `POST /gmv_max/session/create/` — max delivery / creative boost session
- `GET /gmv_max/session/get/` — sessions dalam campaign
- `POST /gmv_max/session/update/`, `POST /gmv_max/session/delete/`
- `GET /gmv_max/store/list/` — TikTok Shops utk GMV Max
- `GET /gmv_max/store/availability/` — cek availability shop
- `GET /gmv_max/identity/get/` — identities
- `GET /gmv_max/post/get/` — posts utk Product GMV Max
- `POST /gmv_max/creative/add_or_remove/` — remove/add creatives
- `POST /gmv_max/creation/shop_video/create/` — customized TikTok posts
- `GET /gmv_max/creation/custom_anchor_video_list/get/` — customized posts detail (pengganti deprecated)
- `GET /gmv_max/creation/shop_video/video_anchors/` — video anchors
- `GET /gmv_max/authorization/status/` — TikTok Shop exclusive auth status
- `POST /gmv_max/authorization/update/` — grant exclusive authorization

---

## 3. SCRAPE CREATORS API

**Base URL:** `https://api.scrapecreators.com`
**Auth:** header `x-api-key`
**OpenAPI:** https://docs.scrapecreators.com/openapi.json · **llms:** https://docs.scrapecreators.com/llms.txt · **llms-full:** https://docs.scrapecreators.com/llms-full.txt
**No rate limits** (recommend <500 concurrent). **Credits:** tiap response ada `credits_remaining` + `credits_charged`. 402 = out of credits.
**Cache:** endpoint tertentu (profile, video) terima `cache_max_age` = `1d/3d/7d/14d/30d` → response cached = **0 credits**.

### Platform coverage (36+): TikTok, TikTok Shop, Instagram, YouTube, LinkedIn, Facebook, Facebook/Google/LinkedIn/TikTok Ad Library, Twitter, Reddit, Threads, Bluesky, Pinterest, Google, Twitch, Apple Music, Spotify, SoundCloud, dll.

### Endpoint TikTok (penting utk Glow FX)
| Path | Param | Response inti |
|---|---|---|
| GET /v1/tiktok/profile | handle ATAU user_id; cache_max_age | user{displayName, avatar, bio, verified, bioLink}, stats{followerCount, followingCount, heartCount, videoCount} |
| GET /v1/tiktok/user/audience | handle (REQ) | audience demographics + countries |
| GET /v3/tiktok/profile/videos | handle (REQ) / user_id; sort_by=latest/popular; max_cursor; region; trim | aweme_list[] (aweme_id, desc, statistics, video, author) |
| GET /v2/tiktok/video | url (REQ); get_transcript; download_media (10 credits!); cache_max_age | video detail + statistics + author |
| GET /v1/tiktok/video/transcript | url | transcript |
| GET /v1/tiktok/video/comments | url | comments |
| GET /v1/tiktok/search/users | query (REQ); cursor; trim | user list |
| GET /v1/tiktok/search/hashtag | hashtag (REQ, tanpa #); region; cursor; trim | aweme_list[] (aweme_id, desc, statistics{play_count, digg_count, comment_count, share_count, collect_count}, video, author) |
| GET /v1/tiktok/search/keyword | query (REQ); date_posted (yesterday/this-week/this-month/last-3-months/last-6-months); sort_by (relevance/most-liked/date-posted); region; cursor; trim | search_item_list[].aweme_info |
| GET /v1/tiktok/search/top | query | photo carousels + videos |
| GET /v1/tiktok/song | clipId (REQ) | music_info{title, author, album, duration, user_count, play_url, cover} |
| GET /v1/tiktok/song/videos | clipId; cursor | aweme_list[] videos pakai sound |
| GET /v1/tiktok/get-trending-feed | region (REQ); trim | trending videos |
| GET /v1/tiktok/creators/popular | page; sortBy (engagement/follower/avg_views); followerCount (10K-100K/100K-1M/1M-10M/10M+); creatorCountry; audienceCountry | popular creators |

### TikTok Shop endpoints
| Path | Param | Response inti |
|---|---|---|
| GET /v1/tiktok/shop/search | query (REQ); page; region (US/GB/DE/FR/IT — non-US unreliable) | products[] {title, cover, url, price, sold_count, review_count, rating, shop_name} |
| GET /v1/tiktok/shop/products | url (REQ store); cursor; sort_by (top/new_releases); region | products[] |
| GET /v1/tiktok/product | url (REQ); region | product_info{product_base{title, images, sold_count, price}, skus[]{stock}, product_detail_review{product_rating, review_count}}, shop_info{shop_name, shop_rating, followers_count}, related_videos[] (affiliate videos) — **US only** |
| GET /v1/tiktok/shop/product/reviews | url ATAU product_id; region; page | product reviews |
| GET /v1/tiktok/user/showcase | handle | user showcase |

### TikTok Ad Library (kompetitor spy)
| Path | Param | Response |
|---|---|---|
| GET /v1/tiktok/ad-library/search | query (REQ, advertiser name/keyword); cursor | ads, global, sorted by latest shown date |
| GET /v1/tiktok/ad-library/ad | ad_id (REQ — material ID / Ads Library ID / library.tiktok.com URL) | ad detail |

### Utility / billing
- GET /v1/account/credit-balance — sisa credit
- GET /v1/account/get-api-usage — request history
- GET /v1/account/get-daily-usage-count — daily usage
- GET /v1/account/get-most-used-routes — routes tersering
- GET /v1/detect-age-gender — AI age/gender dari foto profil

### Response codes
200 success · 400 bad request · 401 invalid/missing key · 402 out of credits · 403 source blocked (age-restricted dll) · 404 not found · 500 server error

### Pitfalls
- **Region TikTok Shop:** hanya US yang reliable (GB/DE/FR/IT limited). Untuk Indonesia pakai TikTok organic search (region=ID) atau TikTok Shop Seller API.
- `download_media=true` di /v2/tiktok/video = **10 credits** (1 credit kalau media ga ketemu) — mahal, pakai hemat.
- `trim=true` buat response kecil (hemat konteks, bukan hemat credit).
- Cursor pagination: pakai `cursor`/`max_cursor`/`min_time` dari response sebelumnya.
- Search by hashtag: region cuma set proxy, bukan filter konten.

---

## MAPPING KE DASHBOARD GLOW FX

| Dashboard module | Sumber API |
|---|---|
| GMV Max: campaign list, status, budget | `/gmv_max/campaign/get/` + `/campaign/gmv_max/info/` |
| GMV Max: KPI cost/net_cost/revenue/ROI/orders | `/gmv_max/report/get/` metrics cost, net_cost, gross_revenue, roi, orders, cost_per_order |
| GMV Max: trend harian | `/gmv_max/report/get/` dimensions `["campaign_id","stat_time_day"]` |
| GMV Max: produk | `/gmv_max/report/get/` dimensions `["item_group_id"]` + attribute product_name |
| GMV Max: creative library + status | `/gmv_max/report/get/` dimensions `["item_id"]` + metrics creative_delivery_status, view rates |
| GMV Max: LIVE | `/gmv_max/report/get/` dimensions `["room_id"]` + metrics live_views, 10_second_live_views, live_follows |
| GMV Max: auto-budget & promotion days | `/campaign/gmv_max/info/` (promotion_days + auto_budget) |
| KOL: roster, tier, tracked posts, views | ScrapeCreators `/v1/tiktok/profile`, `/v3/tiktok/profile/videos`, `/v1/tiktok/video`, `/v1/tiktok/search/hashtag`, `/v1/tiktok/song`, `/v1/tiktok/song/videos` |
| KOL: tren hashtag & sound | `/v1/tiktok/search/hashtag` + `/v1/tiktok/song` (growth WoW) |
| KOL: discovery kandidat | `/v1/tiktok/search/users`, `/v1/tiktok/creators/popular`, `/v1/tiktok/user/audience` |
| Kompetitor spy (Hanasui dll) | ScrapeCreators `/v1/tiktok/ad-library/search` + `/v1/tiktok/ad-library/ad`, TikTok Shop `/v1/tiktok/shop/search`, `/v1/tiktok/shop/products`, `/v1/tiktok/product` |
| Loss analysis / cancellations | TikTok Shop Seller API `/return_refund/202602/cancellations/search` |

## INGAT
- TikTok Business API pakai `Access-Token` header; TikTok Shop Seller API pakai `x-tts-access-token` + `app_key` + `sign` + `timestamp`.
- GMV Max report `store_ids` max **1** — loop per store kalau multi-shop.
- GMV Max campaign `campaign_id` ≠ TikTok Shop `order_id`. Jangan ketuker.
- gross_revenue sudah termasuk platform subsidy.
- Ad account Glow FX (Business API): 7482998844620570640 (GMV Max HANASUI), 7333063512052236289 (GLOW FX), 6950211194280017921 (upper funnel Hanasui).
