# Credentials Status — Glow FX Data Analyst

> Dokumen status kredensial (BUKAN tempat nyimpen nilai secret — nilai ada di `.env.local` yang git-ignored).
> Update terakhir: 2026-08-13.

## Supabase (project aktif)

| Item | Nilai |
|---|---|
| Project URL | `https://ukwaoydxdlzukoitmglh.supabase.co` |
| Env var | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable (anon) key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `sb_publishable_...` |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` — `sb_secret_...` (format baru = service_role, bypass RLS) |
| Status | ✅ VALID (tested: secret key return OpenAPI schema, health 200) |
| Schema | ⚠️ Belum ada tabel (project fresh) |

## TikTok Business API (GMV Max + LIVE)

| Item | Nilai |
|---|---|
| App ID | `7648868791423172625` (env `TIKTOK_APP_ID`) |
| App Secret | env `TIKTOK_APP_SECRET` (`785c...`) |
| Redirect URI | `https://app.glowfx.id/tiktok/oauth/callback` (env `TIKTOK_REDIRECT_URI`) |
| Access token | ✅ DIDAPAT via OAuth (env `TIKTOK_ACCESS_TOKEN`) — `72ee3e2a...` |
| Advertiser ID GLOW FX | `7333063512052236289` (nama "GLOW FX 01.02") |
| Store ID GLOW FX | `7494734706184194419` ("GLOW FX", region ID, ACTIVE, is_gmv_max_available=true) |
| `TIKTOK_GMV_MAX_ACCOUNTS` | ✅ Sudah diisi JSON (brand Glow FX + token + store) |

### Status permission (tested 2026-08-13)
- ✅ `GET /gmv_max/report/get/` — **jalan** (code 0)
- ❌ `GET /gmv_max/campaign/get/` — **permission denied** (40001: "advertiser does not grant you")
- ⚠️ Report data = **kosong** (total_number 0) untuk window 2026-07-15 s/d 08-13 — kemungkinan belum ada spend/campaign belum deliver

### 9 Advertiser IDs yang ke-grant (dari OAuth response)
`7178758003779256321`, `7178760264534228994`, `7333063512052236289` (GLOW FX), `7358761827158769681`, `7364214644990099457`, `7365770335381356561`, `7367210020662099969`, `7386932641880375312`, `7386932845706592273`

## KaloData Open Center (Market Intelligence)

| Item | Nilai |
|---|---|
| Key | env `KALODATA_API_KEY` |
| Status | ✅ Key valid & terbaca |
| Credit | ❌ **0 balance** — perlu top-up |

## ScrapeCreators (KOL)

| Item | Nilai |
|---|---|
| Key | env `SCRAPECREATORS_API_KEY` |
| Status | ✅ Key VALID |
| Credit | ✅ **25,668 credits** (tested via `/v1/account/credit-balance`) |

## TikTok Shop Seller API (Loss Analysis)

| Item | Status |
|---|---|
| app_key / app_secret / shop_cipher / access_token | ❌ Belum ada — belum di-provide user |

---

## Checklist buat go-live (per dashboard)

- [ ] **Market Intel** (KaloData): top-up credit → swap mock → real
- [ ] **GMV Max + LIVE** (Business API): ✅ token+store siap; ⚠️ perlu grant permission `campaign/get`; report udah jalan tapi data kosong (tunggu ada spend)
- [ ] **Loss** (Seller API): provide app_key+secret+shop_cipher+token + scope approve
- [ ] **KOL** (ScrapeCreators): ✅ key siap (25k credits), tinggal bikin sync + snapshot table
- [ ] **Supabase**: bikin schema SQL (semua tabel) + aktifkan RLS policy
