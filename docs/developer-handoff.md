# HERMES Data Analyst — Developer Handoff

> Dokumen utama untuk developer yang melanjutkan HERMES Data Analyst.
> Update terakhir: 28 Agustus 2026.
>
> **Kondisi saat ini:** UI dashboard sudah berfungsi dengan mock data. Sebagian integration layer
> TikTok Business API, ScrapeCreators, Shopee Open Platform, dan Supabase sudah tersedia, tetapi
> dashboard belum membaca hasil sync tersebut. Jangan menganggap label "API-ready" sebagai tanda
> bahwa halaman sudah memakai data production.

## 1. Apa yang sedang dibangun

HERMES adalah internal commerce intelligence dashboard untuk Glow FX Beauty. Tujuannya bukan hanya
melihat Ads Manager, tetapi menghubungkan seluruh growth system:

```text
Brand → Content → Traffic → Ads → Affiliate → Marketplace
      → Conversion → Revenue → Profit → Retention/LTV
```

Dashboard yang sudah ada:

| Route | Fungsi bisnis | Status data saat ini |
|---|---|---|
| `/gmv-max` | TikTok Product GMV Max: spend, revenue, ROI, campaign, product, creative | Mock |
| `/live-gmv-max` | TikTok LIVE GMV Max dan performa live session | Mock |
| `/creator` | Affiliate creator, campaign, content, PIC, competition | Mock |
| `/kol` | Implementasi yang sama dengan `/creator` | Mock |
| `/loss` | Cancellation, refund, dan action deadline seller TikTok Shop | Mock |
| `/market-intel` | Glow FX vs kompetitor Indonesia | Mock |
| `/shopee` | Order, fulfillment, product, return, AMS ads, affiliate, live/video | Mock |

`/creator` saat ini hanya melakukan re-export dari `/kol`. URL publik menggunakan istilah
"Creator", sedangkan nama folder dan sebagian tipe internal masih menggunakan "KOL".

## 2. Prinsip domain dan brand

- **Glow FX adalah brand internal.**
- **Hanasui adalah kompetitor**, bukan account/brand internal.
- Account NCO, FYNE, BRIMO, Eomma, dan Multibrand berada di luar scope.
- Currency utama IDR dan timezone operasional `Asia/Jakarta`.
- Jangan membuat klaim medis atau ilmiah skincare yang tidak didukung sumber.
- Untuk KPI gabungan, hitung ratio dari total numerator/denominator. Jangan mengambil rata-rata
  langsung dari ROI, ROAS, conversion rate, atau cost per order per baris.

## 3. Arsitektur repository

```text
app/
├── <domain>/page.tsx        Server page: filter, orchestration, dan layout
├── <domain>/*.tsx           Table, chart, card, dan section khusus domain
└── api/                     OAuth callback dan server-side sync jobs

lib/
├── <domain>/types.ts        Kontrak data UI/domain
├── <domain>/mock-data.ts    Dataset dummy dengan shape mendekati API
├── <domain>/aggregate.ts    Pure calculation: KPI, rollup, trend, alerts
├── <domain>/format.ts       Currency, number, date, dan percentage formatter
├── <domain>/client.ts       API client jika sudah tersedia
└── supabase.ts              Supabase service-role client, server-only

docs/
├── api-reference.md         Detail TikTok Business, TikTok Shop, ScrapeCreators
├── kalodata-open-center.md  Detail endpoint dan field KaloData
├── shopee-open-api.md       Auth, signing, dan endpoint Shopee
├── supabase-schema.sql      Schema target semua sumber data
└── credentials-status.md    Status integrasi; tidak menyimpan nilai secret
```

Alur UI yang benar-benar berjalan sekarang:

```text
mock-data.ts → aggregate.ts → page.tsx → table/chart components
```

Alur integration layer yang sudah ada tetapi belum dipakai UI:

```text
External API → app/api/.../route.ts → Supabase

Supabase → lib/.../queries.ts  (baru tersedia untuk GMV Max)
```

Target production:

```text
External API → scheduled sync → raw/normalized Supabase tables
                                ↓
Page → domain repository/query → domain types → aggregate → UI
                                ↘ development-only mock fallback
```

## 4. Source-of-truth matrix

Tabel ini menjawab: "mockup yang terlihat di dashboard seharusnya berasal dari API mana?"

| Dashboard / section | Mock sekarang | API production yang dituju | Target storage |
|---|---|---|---|
| GMV Max campaign status | `lib/gmv-max/mock-data.ts` | TikTok Business `GET /open_api/v1.3/gmv_max/campaign/get/` | `gmv_max_campaigns` |
| GMV Max target ROI/budget | Field mock campaign | TikTok Business `GET /campaign/gmv_max/info/` dan sebagian attribute report | Kolom campaign; schema perlu diperluas |
| GMV Max cost/revenue/orders | `MOCK_DAILY_METRICS` | TikTok Business `GET /gmv_max/report/get/` | `gmv_max_report_daily` |
| GMV Max product | `MOCK_PRODUCTS` | GMV Max report dimensions `item_group_id`, `item_id` + product attributes | `gmv_max_report_daily`, idealnya product dimension table |
| GMV Max creative | `MOCK_CREATIVES` | GMV Max report dimension `item_id`, creative status dan video-view metrics | `gmv_max_report_daily`, idealnya creative dimension table |
| LIVE GMV Max | `lib/live-gmv-max/mock-data.ts` | GMV Max report, promotion type `LIVE`, dimension `room_id` | `gmv_max_report_daily` |
| Creator affiliate commerce | `lib/kol/affiliate-mock-data.ts` | TikTok Shop Affiliate/Partner export or approved affiliate API | Schema affiliate belum final |
| Creator public profile/content | Mock profile/video | ScrapeCreators TikTok profile, profile videos, video detail | `kol_creators`, `kol_tracked_posts`, `kol_post_snapshots` |
| Creator competition/PIC | Mock campaign, competition, PIC | Internal operational input/CRM/Sheet; bukan public TikTok metric | Tabel internal belum dibuat |
| Loss/cancellation | `lib/loss/mock-data.ts` | TikTok Shop Seller API `POST /return_refund/202602/cancellations/search` | `cancellations` |
| Market shop ranking | `lib/market-intel/mock-data.ts` | KaloData `POST /tiktok/shop/rank` dan `/shop/detail` | `kalodata_shops` |
| Market product/category | Mock product/category | KaloData product/category rank/detail | `kalodata_products`, `kalodata_categories` |
| Market creator/video/live | `benchmark-mock-data.ts` | KaloData creator/video/livestream rank/detail | `kalodata_creators`, `kalodata_videos`; live table belum ada |
| Shopee order/fulfillment | `lib/shopee/mock-data.ts` | Shopee Order APIs | `shopee_orders`, `shopee_order_items` |
| Shopee products | `MOCK_PRODUCTS` | Shopee Product APIs | `shopee_products`, `shopee_product_models` |
| Shopee returns | `MOCK_RETURNS` | Shopee Returns APIs | `shopee_returns` |
| Shopee Ads | `MOCK_ADS_DAILY` | Shopee AMS performance APIs | `shopee_ads_performance` |
| Shopee affiliate | `MOCK_AFFILIATES` | Shopee AMS affiliate performance | `shopee_ads_affiliate_performance` |
| Shopee account health | `MOCK_ACCOUNT_HEALTH` | Shopee AccountHealth APIs | `shopee_account_health` |
| Shopee live/video | Mock live/video | Shopee Livestream dan Video APIs | `shopee_livestream_sessions`, `shopee_videos` |

Detail parameter, permission, rate limit, dan response field berada di:

- [TikTok commerce API reference](./api-reference.md)
- [KaloData reference](./kalodata-open-center.md)
- [Shopee Open Platform reference](./shopee-open-api.md)

## 5. Dashboard-by-dashboard mapping

### 5.1 GMV Max

**File utama**

- UI orchestration: `app/gmv-max/page.tsx`
- Mock data: `lib/gmv-max/mock-data.ts`
- Calculation: `lib/gmv-max/aggregate.ts`
- TikTok client: `lib/gmv-max/tiktok.ts`
- Account config: `lib/gmv-max/accounts.ts`
- Supabase query: `lib/gmv-max/queries.ts`
- Sync route: `app/api/sync/gmv-max/route.ts`

**API mapping**

| UI field | TikTok source |
|---|---|
| Campaign ID/name/status | `/gmv_max/campaign/get/` |
| Promotion type | campaign filter/result: `PRODUCT_GMV_MAX` atau `LIVE_GMV_MAX` |
| Cost | report metric `cost` |
| Net cost | `net_cost` |
| Gross revenue | `gross_revenue` |
| Orders | `orders` |
| ROI | display boleh memakai API `roi`; aggregate wajib `sum(gross_revenue) / sum(cost)` |
| Cost/order | `sum(cost) / sum(orders)` |
| Product impression/click | `product_impressions`, `product_clicks` |
| Creative status | `creative_delivery_status` |
| Video retention | `ad_video_view_rate_2s`, `6s`, `p25`, `p50`, `p75`, `p100` |
| LIVE views/follows | `live_views`, `10_second_live_views`, `live_follows` |

**Sync yang sudah diimplementasikan**

`POST /api/sync/gmv-max?days=7` melakukan:

1. Loop setiap account dari `TIKTOK_GMV_MAX_ACCOUNTS`.
2. Fetch Product dan LIVE campaign metadata.
3. Loop setiap store karena report menerima maksimal satu `store_id`.
4. Fetch Product dan LIVE report dengan pagination.
5. Normalisasi metric string menjadi number.
6. Upsert ke Supabase.

**Belum selesai**

- Page masih mengimpor mock, bukan `getReportRows()`/`getCampaigns()`.
- Endpoint `/campaign/gmv_max/info/` belum diimplementasikan, jadi budget, `roas_bid`, auto-budget,
  dan promotion-day settings belum berasal dari API.
- Product/creative display membutuhkan dimension/attribute data yang lebih lengkap dari schema saat ini.
- Query Supabase berhenti pada 20.000 row tanpa pagination.

### 5.2 LIVE GMV Max

**File utama:** `app/live-gmv-max/` dan `lib/live-gmv-max/`.

LIVE menggunakan sumber API yang sama dengan GMV Max, tetapi:

- Filter `gmv_max_promotion_types: ["LIVE"]`.
- Dimension utama `campaign_id`, `stat_time_day`, dan `room_id`.
- Metric utama `cost`, `net_cost`, `orders`, `gross_revenue`, `roi`, `live_views`,
  `10_second_live_views`, `cost_per_live_view`, dan `live_follows`.

Mock LIVE saat ini terpisah dari mock GMV Max. Saat production migration, keduanya sebaiknya membaca
repository/report table yang sama agar total LIVE pada kedua dashboard tidak berbeda.

Filter pada page LIVE saat ini bersifat visual dan belum memengaruhi data.

### 5.3 Creator / Affiliate

**File utama**

- Page: `app/kol/page.tsx`, di-export ulang oleh `app/creator/page.tsx`
- Affiliate mock: `lib/kol/affiliate-mock-data.ts`
- Calculation: `lib/kol/affiliate-aggregate.ts`
- Public post sync: `app/api/sync/kol/route.ts`

Dashboard menggabungkan dua jenis data yang harus dibedakan:

1. **Public/social data** — follower, views, likes, comments, shares, video metadata.
   Sumber yang sudah dipilih adalah ScrapeCreators.
2. **Commerce/internal affiliate data** — GMV, NMV, order, commission, sample application,
   fulfillment, PIC ownership, competition membership. Data ini tidak bisa direkonstruksi hanya dari
   public TikTok profile. Sumbernya harus approved TikTok Shop affiliate API, export Seller Center,
   atau internal operational source seperti Google Sheets/CRM.

Endpoint sync yang ada hanya memperbarui engagement untuk URL di `kol_tracked_posts` melalui:

```text
GET https://api.scrapecreators.com/v2/tiktok/video
```

Endpoint tersebut belum mengisi affiliate GMV, NMV, commission, PIC, sample, atau competition data.

**Rumus penting**

- NMV = GMV − cancelled value − returned value − refunded value.
- Growth membandingkan current range dengan previous range yang panjangnya sama.
- Valid content mengikuti rule campaign/competition, bukan sekadar video memiliki views.
- Username harus dinormalisasi sebelum join dengan creator profile.

### 5.4 Loss Analysis

**File utama:** `app/loss/` dan `lib/loss/`.

Mock mengikuti response TikTok Shop Seller API:

```text
POST /return_refund/202602/cancellations/search
```

Mapping utama:

| UI/domain | API field |
|---|---|
| Cancel ID/order | `cancel_id`, `order_id` |
| Actor/type/status | `role`, `cancel_type`, `cancel_status` |
| Reason | `cancel_reason`, `cancel_reason_text` |
| Refund | `refund_amount.*` |
| Seller deadline | `seller_next_action_response[].deadline` |
| Product/SKU | `cancel_line_items[]` |
| Replenish alert | `should_replenish_stock` |

Belum ada TikTok Shop Seller client atau sync route. Credentials dan scope
`seller.return_refund.basic` juga harus tersedia sebelum integrasi.

Filter Loss saat ini belum berfungsi; semua KPI selalu dihitung dari seluruh mock rows.

### 5.5 Market Intelligence

**File utama:** `app/market-intel/` dan `lib/market-intel/`.

Sumber production utama adalah KaloData Open Center untuk region `ID`, language `id-ID`, currency
`IDR`. KaloData dipilih karena public TikTok Shop endpoint alternatif tidak reliable untuk Indonesia.

| UI section | KaloData endpoint |
|---|---|
| Brand ranking/channel mix | `/tiktok/shop/rank`, `/tiktok/shop/detail` |
| Product ranking/hero SKU/breakout | `/tiktok/product/rank`, `/tiktok/product/detail` |
| Market size/category growth | `/tiktok/category/rank`, `/tiktok/category/detail` |
| Creator benchmark | `/tiktok/creator/rank`, `/tiktok/creator/detail` |
| Video ROAS | `/tiktok/video/rank`, `/tiktok/video/detail` |
| Livestream benchmark | `/tiktok/livestream/rank`, `/tiktok/livestream/detail` |

Mock shops adalah tracked comparison set, bukan seluruh pasar. Karena itu UI membedakan:

- **Share (brand tracked):** Glow FX revenue / total revenue tracked shops.
- **Market share:** membutuhkan category total market dari KaloData; jangan menyebut tracked share
  sebagai total market share.

KaloData sync/client belum tersedia di repository. Filter category, period, dan shop type saat ini
hanya visual.

### 5.6 Shopee

**File utama**

- Page: `app/shopee/page.tsx`
- UI sections: `app/shopee/*.tsx`
- Mock/types/aggregate: `lib/shopee/`
- Signing/token helper: `lib/shopee/sign.ts`, `accounts.ts`, `client.ts`
- OAuth: `app/api/shopee/auth/route.ts`, `app/api/shopee/callback/route.ts`

**Auth flow yang sudah tersedia**

```text
GET /api/shopee/auth
  → redirect seller ke Shopee
  → GET /api/shopee/callback?code=...&shop_id=...
  → exchange token
  → simpan token per shop di shopee_shops
```

`getValidShopeeToken()` membaca token dari Supabase dan melakukan refresh jika expiry kurang dari
30 menit. `shopeeShopGet()` membangun signed Shop API request.

**Belum selesai**

- Belum ada sync routes untuk order, products, return, AMS, health, live, atau video.
- Page masih membaca seluruh `MOCK_*`.
- Operational order tab sengaja menunjukkan current state dan tidak mengikuti date filter; ini harus
  dipertahankan atau dijelaskan jelas jika behavior diubah.
- Return KPI mengikuti date filter, tetapi top returned products masih memakai seluruh mock history.

## 6. KPI definitions

Gunakan definisi yang sama antara mock, SQL, dan production API:

| KPI | Definisi |
|---|---|
| ROI / ROAS | `gross revenue / cost` |
| Cost per order | `cost / orders` |
| NMV | `GMV - cancelled - returned - refunded value` |
| Return rate | `return requests / relevant orders` |
| CTR | `clicks / impressions` |
| Conversion rate | `orders / clicks` |
| Affiliate contribution | `affiliate revenue / total revenue` |
| Revenue per creator | `revenue / active creator count` |

Rules:

- Return `0` ketika denominator nol, kecuali UI membutuhkan `null/—` untuk membedakan “tidak ada
  data” dari performa nol.
- Agregasi ratio selalu dilakukan setelah numerator dan denominator dijumlahkan.
- Currency jangan dicampur tanpa conversion layer.
- Date boundary harus eksplisit menggunakan timezone bisnis; jangan bergantung pada timezone mesin.

## 7. Supabase dan security boundary

`lib/supabase.ts` menggunakan `SUPABASE_SERVICE_ROLE_KEY`. Client ini:

- Hanya boleh di-import oleh server component, route handler, atau server-only module.
- Tidak boleh dipindahkan ke React client component.
- Tidak boleh mengirim token, secret, atau raw credential ke browser/log.

Schema target ada di `docs/supabase-schema.sql`. Sebelum menjalankan migration, review kembali
primary key dan tenancy scope. Khusus `gmv_max_report_daily`, key saat ini belum memasukkan
`advertiser_id` dan `store_id`.

Semua endpoint sync wajib menggunakan authentication yang **fail closed**:

```text
SYNC_TRIGGER_SECRET tidak terpasang → configuration error
Authorization salah/tidak ada       → 401 Unauthorized
Authorization valid                 → sync boleh berjalan
```

Implementasi sekarang masih fail-open ketika `SYNC_TRIGGER_SECRET` kosong dan harus diperbaiki
sebelum deploy publik.

## 8. Environment variables

Gunakan `.env.local.example` sebagai template. Nilai asli hanya di `.env.local` atau secret manager.

| Variable | Dipakai untuk |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access |
| `SYNC_TRIGGER_SECRET` | Protect sync endpoints |
| `SYNC_LOOKBACK_DAYS` | Default GMV Max sync window |
| `TIKTOK_GMV_MAX_ACCOUNTS` | Brand, advertiser, token, dan store mapping |
| `SCRAPECREATORS_API_KEY` | Public TikTok creator/post sync |
| `KALODATA_API_KEY` | Market intelligence, setelah credit tersedia |
| `SHOPEE_PARTNER_ID` | Shopee app identity |
| `SHOPEE_PARTNER_KEY` | Shopee request signing secret |
| `SHOPEE_REDIRECT_URI` | OAuth callback URL |
| `SHOPEE_API_BASE` | Production/sandbox base URL |

Jangan menambahkan nilai secret ke dokumentasi, screenshot, fixture, atau git history.

## 9. Status implementasi per layer

Legend: ✅ tersedia · 🟡 sebagian · ❌ belum tersedia

| Domain | UI mock | Types/aggregate | API client | Sync job | DB query | UI real data |
|---|---:|---:|---:|---:|---:|---:|
| GMV Max | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ |
| LIVE GMV Max | ✅ | ✅ | 🟡 shared | 🟡 shared | ❌ | ❌ |
| Creator affiliate | ✅ | ✅ | 🟡 public only | 🟡 public post only | ❌ | ❌ |
| Loss | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Market Intel | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Shopee | ✅ | ✅ | 🟡 auth/helper | ❌ | ❌ | ❌ |

## 10. Recommended implementation order

### Phase 0 — Safety and correctness

1. Make sync authentication fail closed.
2. Validate date/lookback input.
3. Check every Supabase update/insert/upsert error.
4. Add pagination or explicit incomplete-data signal.

### Phase 1 — GMV Max vertical slice

1. Create a GMV Max repository that returns domain types.
2. Read campaign/report rows from Supabase.
3. Map DB snake_case fields to domain camelCase once, inside repository.
4. Switch `/gmv-max` from direct mock imports to repository.
5. Keep mock fallback only behind an explicit development flag.
6. Compare dashboard totals with direct SQL and TikTok report totals.

### Phase 2 — Shared LIVE data

Move `/live-gmv-max` to the same repository/report source and filter promotion type `LIVE_GMV_MAX`.

### Phase 3 — Shopee ingestion

After Shopee app approval/auth, implement order → product → return → AMS → health → content sync in
that order. Order and return data unlock the most operational value first.

### Phase 4 — Creator and market intelligence

- Separate public creator engagement from private affiliate commerce facts.
- Define the internal source for PIC, samples, competition, and commission.
- Top up KaloData, then implement cached rank/detail ingestion.

## 11. Testing expectations

Before a domain is considered production-backed, it needs:

- Unit tests for every aggregate and ratio.
- Mapping tests using sanitized real API response fixtures.
- Pagination tests: empty, one page, multiple pages.
- Authentication tests for sync routes.
- Database error-path tests.
- Date boundary and timezone tests.
- Reconciliation test against one manually verified API/SQL period.

Current automated coverage is limited to affiliate aggregation. Passing tests do not yet validate
the other dashboards or integrations.

## 12. Definition of done for a production dashboard

A dashboard is not “live” until all items below are true:

- [ ] Header no longer says mock data.
- [ ] Page has no direct import from `mock-data.ts`.
- [ ] Source endpoint and table are documented.
- [ ] Sync is authenticated, idempotent, paginated, and observable.
- [ ] API/DB errors are surfaced and do not silently become zero.
- [ ] Latest sync timestamp and data freshness are visible.
- [ ] Empty state is distinguishable from zero performance.
- [ ] KPI totals reconcile with source for a known period.
- [ ] Tests cover mapping, aggregation, and failure paths.
- [ ] Credentials remain server-only.

## 13. Common traps

- Do not average daily ROI or ROAS.
- Do not treat Hanasui as a Glow FX internal brand/account.
- Do not mix TikTok advertiser ID, store ID, campaign ID, room ID, item group ID, and item ID.
- TikTok GMV Max report accepts only one store ID per request.
- GMV Max daily report range is capped at 30 days when using `stat_time_day`.
- ScrapeCreators public engagement cannot produce affiliate GMV or commission.
- KaloData rank data is estimated market intelligence, not Glow FX financial ledger data.
- Shopee access token expires quickly; always go through the refresh helper.
- Image/video URLs from commerce APIs can be temporary; do not treat them as permanent assets.
- A filter control in the UI does not mean filtering is implemented—trace `searchParams` to the
  actual dataset before assuming it works.

## 14. First-day checklist for a new developer

1. Read this document and `AGENTS.md`.
2. Read the API reference for the domain being changed.
3. Run `npm test`, TypeScript check, lint, and production build.
4. Confirm whether the target page is mock-backed or production-backed.
5. Trace one KPI from UI label to aggregate function to raw field.
6. Never test a paid API in a loop without checking pagination, cache, and credit behavior.
7. Update this document and the source matrix whenever a dashboard changes data source.

