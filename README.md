# HERMES — Data Analyst (GLOW FX)

TikTok commerce intelligence untuk GLOW FX. MVP saat ini: **GMV Max ROI Dashboard**
(cost/ROI/funnel/watch-through per campaign → produk → video/livestream dari TikTok
Business API GMV Max).

Pakai Supabase project yang sama dengan `meta_ads_performance`, `google_ads_performance`,
`tiktok_ads_performance`, `criteo_ads_performance`, `social_mentions`, `competitor_updates`
(project `ysdxidfuwnweqplqkzqb`) — bukan project baru.

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local` (sudah ada URL + anon key project; isi sisanya):
   - `SUPABASE_SERVICE_ROLE_KEY` — dari Supabase Dashboard > Project Settings > API.
     **Wajib**, karena tabel `gmv_max_campaigns`/`gmv_max_report_daily` RLS-nya aktif
     tanpa public policy (sama seperti `tiktok_ads_performance`) — cuma service role
     yang bisa baca/tulis.
   - `TIKTOK_GMV_MAX_ACCOUNTS` — JSON array, satu entry per brand:
     ```json
     [{"brand":"Glow FX","advertiser_id":"...","access_token":"...","store_ids":["..."]}]
     ```
     `advertiser_id` + `access_token` dari TikTok Business API app yang sudah
     diauthorize ke ad account brand tsb. `store_ids` didapat dari
     `GET /gmv_max/store/list/` (belum diimplementasikan di sini — ambil manual
     lewat API Explorer TikTok dulu, atau minta ke tim ads).
3. `npm run dev` → buka `http://localhost:3000/gmv-max`

Tanpa `SUPABASE_SERVICE_ROLE_KEY` terisi, halaman `/gmv-max` akan menampilkan
pesan "belum siap" (bukan crash) — ini behavior yang disengaja.

## Sync data GMV Max

`POST /api/sync/gmv-max` menarik data dari TikTok Business API dan upsert ke Supabase:
1. `GET /gmv_max/campaign/get/` per brand & tipe (PRODUCT/LIVE) → `gmv_max_campaigns`
2. `GET /gmv_max/report/get/` per brand, store, tipe, breakdown harian × produk/video
   (atau × livestream buat LIVE) → `gmv_max_report_daily`

Jalankan manual:
```bash
curl -X POST http://localhost:3000/api/sync/gmv-max
# atau backfill custom range:
curl -X POST "http://localhost:3000/api/sync/gmv-max?days=30"
```

Default lookback 7 hari (`SYNC_LOOKBACK_DAYS`), maksimum 30 hari sekali panggil karena
TikTok membatasi rentang tanggal saat breakdown harian dipakai. Untuk produksi, jadwalkan
lewat cron (mis. Vercel Cron / Supabase Edge Function scheduled) yang memanggil endpoint
ini tiap jam, dan set `SYNC_TRIGGER_SECRET` supaya endpoint tidak bisa dipicu publik
(request harus bawa header `Authorization: Bearer <SYNC_TRIGGER_SECRET>`).

Sync ini idempoten — upsert pakai unique constraint
`(campaign_id, day, item_group_id, item_id, room_id)`, jadi aman dipanggil berkali-kali
untuk rentang tanggal yang sama.

## Verifikasi end-to-end

1. Jalankan sync manual sekali (lihat di atas), cek response JSON-nya —
   `report_rows_synced` per brand harus > 0 kalau ada data di rentang tanggal itu.
2. Cek langsung di Supabase:
   ```sql
   select brand, count(*), sum(cost), sum(gross_revenue)
   from gmv_max_report_daily group by brand;
   ```
3. Buka `/gmv-max`, bandingkan angka KPI di layar dengan hasil query manual di atas.
4. Panggil sync sekali lagi dengan rentang tanggal yang sama — jumlah baris di
   `gmv_max_report_daily` untuk rentang itu tidak boleh berubah (hanya `updated_at`
   dan angka metrik yang ter-refresh), membuktikan upsert idempoten.

## Struktur

- `lib/gmv-max/tiktok.ts` — TikTok Business API client (campaigns + report, dengan paginasi)
- `lib/gmv-max/accounts.ts` — parse `TIKTOK_GMV_MAX_ACCOUNTS`
- `lib/gmv-max/queries.ts` — baca dari Supabase (service role)
- `lib/gmv-max/aggregate.ts` — agregasi KPI/tren harian/breakdown produk/video/campaign,
  termasuk flag "creative fatigue" (watch-through 2s/6s jauh di bawah rata-rata campaign)
- `app/api/sync/gmv-max/route.ts` — sync job
- `app/gmv-max/page.tsx` — dashboard

## Roadmap (belum dibangun)

Urutan berikutnya sesuai keputusan di sesi perencanaan:
- **#2 Cancellation/return loss analysis** — tabel baru `tiktok_shop_cancellations` dari
  TikTok Shop Partner API (`Search Cancellations` dkk.), join ke `gmv_max_report_daily`
  buat hitung net ROI setelah cancel/return.
- **#4 Competitive benchmarking** — sync job ScrapeCreators (Shop Search/Products/Reviews,
  Ad Library) → isi tabel `competitor_updates` yang sudah ada.
- **#5 Trend & creator discovery** — sync job ScrapeCreators (hashtag/keyword search,
  trending feed, song) → isi tabel `social_mentions` yang sudah ada.
