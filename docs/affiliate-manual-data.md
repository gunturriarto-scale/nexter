# Affiliate Dashboard — Data yang Diisi Manual Tim Internal

Dashboard `/creator` (Affiliate Creator Intelligence) sekarang jalan 100% pakai
data dummy. Buat go-live, sebagian besar angka ditarik otomatis dari API TikTok,
tapi **ada beberapa data yang TikTok nggak kasih** — ini harus dibikin & dirawat
tim affiliate.

Dokumen ini: apa aja datanya, formatnya, siapa yang isi, seberapa sering, dan
**bagian dashboard mana yang mati kalau data itu kosong / basi.**

> Belum ada tabel affiliate di `docs/supabase-schema.sql`. Sambil nunggu tabel +
> admin UI dibuat, pakai Google Sheet (lihat [§10](#10-cara-ngumpulin-interim)).

---

## 1. API vs Manual

| Ditarik otomatis dari API TikTok | Diisi manual tim internal |
|---|---|
| GMV, NMV, orders, komisi, cancel/return/refund (video analytics + affiliate orders) | Mapping creator → PIC |
| Daftar video + tanggal post + hashtag + judul | Resolusi handle/alias creator |
| Username, display name, follower count creator | Definisi campaign + aturan hashtag |
| — | Setup kompetisi (peserta, tanggal, hashtag) |
| — | Snapshot Creator Level bulanan |
| — | Roster PIC / AM |
| — | Internal tag creator (opsional) |

---

## 2. Ringkasan — semua data manual

| # | Data | Siapa yang isi | Seberapa sering | Rusak kalau kosong |
|---|---|---|---|---|
| 1 | Roster PIC / AM | Lead Affiliate | Sekali, update kalau tim berubah | Nggak ada kunci grouping — semua fitur PIC mati |
| 2 | Mapping creator → PIC | Masing-masing AM | **Ongoing** — tiap rekrut creator baru | Tab **Per Creator** & scoreboard PIC kosong |
| 3 | Identity / alias creator | Data/ops | **Reaktif** — tiap banner "Data quality" nyala | GMV creator itu ke-drop dari KPI + leaderboard |
| 4 | Internal tag creator | AM / Lead | Opsional, review berkala | Filter "Internal tag" nggak kepake |
| 5 | Definisi campaign | Marketing / Lead | Sekali per campaign | KPI "Valid videos" + tab **Konten** nggak akurat |
| 6 | Attribution video → campaign | *(butuh keputusan — [§8](#8-keputusan-yang-harus-diambil))* | — | GMV/validitas video salah campaign |
| 7 | Setup kompetisi | Lead Affiliate | Sekali per kompetisi, sebelum mulai | Tab **Competition** nggak jalan |
| 8 | Snapshot Creator Level | Data/ops | **Tiap bulan** | Kolom "TikTok level" → "Unavailable" |
| 9 | Commission rate | *(butuh konfirmasi sumber — [§8](#8-keputusan-yang-harus-diambil))* | — | — |

---

## 3. Roster PIC / AM

Daftar affiliate manager. Tiap creator nanti "dimiliki" satu PIC.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `picId` | slug unik, huruf kecil, `pic-<nama>` | `pic-sissy` | ✅ |
| `name` | nama tampil | `Sissy` | ✅ |
| `avatarSeed` | string bebas buat warna avatar (boleh = name) | `sissy` | — |

- **Owner:** Lead Affiliate
- **Cadence:** sekali; edit kalau ada AM masuk/keluar
- **Kode:** `AffiliatePic` di `lib/kol/affiliate-types.ts`
- **Dampak dashboard:** ini fondasi semua fitur PIC. Kalau kosong, tab **Per
  Creator** (kartu **Performance by PIC** + **Creator breakdown by PIC**) nggak
  ada isinya.

---

## 4. Mapping creator → PIC

Tiap affiliate creator ditandain **satu** PIC yang meng-onboard dia. Ini poin
utama — tanpa ini scoreboard per-AM nggak bisa dihitung.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `creatorId` | ID internal creator (stabil, jangan pakai username) | `creator-sissy-0` | ✅ |
| `username` | handle utama TikTok, pakai `@` | `@kulitsehat.id` | ✅ |
| `displayName` | nama tampil | `Kulit Sehat ID` | ✅ |
| `pic` | `picId` dari [§3](#3-roster-pic--am) | `pic-sissy` | ✅ |

- **Owner:** masing-masing AM buat creator-nya sendiri
- **Cadence:** **ongoing** — tiap kali AM approach/onboard creator baru,
  langsung tambah barisnya
- **Kode:** field `pic` di `AffiliateCreatorProfile`
- **Dampak dashboard:**
  - Kartu **Performance by PIC** (tab Per Creator) — jumlah creator, video, GMV,
    NMV, GMV Live/Video per AM
  - Tabel **Creator breakdown by PIC** — daftar creator di bawah tiap AM
  - Creator yang `pic`-nya kosong / nunjuk ke `picId` yang nggak ada di roster:
    tetap muncul di leaderboard umum, tapi **hilang dari semua tampilan PIC**.
    Solusi: sediain PIC dummy `pic-unassigned` biar ketahuan.

**Catatan aturan:** satu creator = satu PIC (scalar, bukan list). Kalau ada
creator yang di-handle bareng, tentuin satu PIC "penanggung jawab utama".

---

## 5. Identity / alias creator

Data fact dateng dari TikTok di-key pakai **username**, bukan ID. Masalahnya:
username bisa beda-beda antar sumber (video analytics vs affiliate orders vs
marketplace), atau creator ganti handle. Sistem nyocokin lewat *identity map*;
kalau ada username yang nggak kecocok, dia dikeluarin dari perhitungan.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `creatorId` | ID internal (lihat §4) | `creator-sissy-0` | ✅ |
| `username` | handle utama sekarang | `@kulitsehat.id` | ✅ |
| `usernameAliases` | list handle lama / varian, tiap-tiap pakai `@` | `["@kulitsehat.glow", "@kulitsehat"]` | — |

- **Owner:** Data/ops (atau AM kalau kenal creatornya)
- **Cadence:** **reaktif** — dipicu sama banner kuning di dashboard:
  > **Data quality:** *N* username belum cocok dengan identity map (`@handle.xxx`).
  > Record tersebut dikeluarkan dari KPI dan leaderboard.

  Tiap banner ini muncul, cari creator yang bener → tambahin username yang
  ke-flag itu ke `usernameAliases`-nya. Banner ilang begitu semua kecocok.
- **Kode:** `username` + `usernameAliases` di `AffiliateCreatorProfile`;
  logika di `buildCreatorIdentityMap` / `findUnmatchedUsernames` /
  `DataQualityNotice`. Pencocokan: lowercase + dipastiin ada `@` di depan.
- **Dampak dashboard:** username yang nggak kecocok = GMV/orders/komisi-nya
  **nggak masuk** KPI, trend, leaderboard, maupun scoreboard PIC.

---

## 6. Internal tag creator *(opsional)*

Label segmentasi buatan tim, dipakai buat filter di dashboard.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `creatorId` | ID internal | `creator-sissy-0` | ✅ |
| `tags` | list string bebas, tapi konsisten | `["Top Seller", "Video-focused"]` | — |

- Nilai yang lagi dipakai di dummy: `Top Seller`, `Rising Star`, `New Affiliate`,
  `Beauty Expert`, `Video-focused`. Bebas ganti — daftar filter di dashboard
  otomatis ngikut nilai yang ada.
- **Owner:** AM / Lead · **Cadence:** opsional, review berkala
- **Kode:** `tags[]` di `AffiliateCreatorProfile` → dipakai `creatorMatches` →
  dropdown **Internal tag** di filter bar.
- **Dampak:** cuma filter. Kosong = dropdown "Internal tag" nggak berguna, sisanya
  jalan normal.

---

## 7. Definisi campaign

Tiap campaign affiliate: identitas + **aturan hashtag** yang nentuin sebuah video
dianggap "valid" atau nggak.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `campaignId` | slug unik | `campaign-glowbomb` | ✅ |
| `name` | nama campaign | `Glow Bomb Always-on` | ✅ |
| `status` | `ACTIVE` \| `ENDED` | `ACTIVE` | ✅ |
| `requiredHashtags` | list hashtag "resmi" campaign (biasanya 5), pakai `#` | `["#GlowFX", "#GlowBomb", "#KulitCerah", "#SerumLokal", "#RacunSkincare"]` | ✅ |
| `minimumHashtagMatches` | berapa hashtag minimal harus cocok biar video "valid" | `3` | ✅ |

- **Owner:** Marketing / Lead · **Cadence:** sekali pas campaign dibikin;
  update kalau `status` berubah
- **Kode:** `AffiliateCampaign` di `lib/kol/affiliate-types.ts`; validasi di
  `validateVideoHashtags` (normalisasi: hapus `#` di depan, lowercase, cocok
  per-token, duplikat nggak dihitung 2x).
- **Dampak dashboard:**
  - KPI **Valid videos** di tab Ringkasan
  - Tab **Konten** (Affiliate video validation) — kolom Matched & status
    VALID/INVALID
  - Kolom **Valid** (`x/y`) di leaderboard

---

## 8. Keputusan yang harus diambil

Dua hal ini bukan cuma "isi data" — perlu diputusin dulu caranya sebelum
ingestion dibangun.

### 8a. Attribution video → campaign

Field `AffiliateVideo.campaignId` — satu video nempel ke satu campaign. TikTok
kasih video + hashtag-nya, tapi **campaign mana yang "punya" video itu** butuh
aturan. Opsi:

| Opsi | Plus | Minus |
|---|---|---|
| Auto — cocokin hashtag video ke `requiredHashtags` campaign | Nol effort manual | Ambigu kalau video kena hashtag 2 campaign; video promo tanpa hashtag campaign kelewat |
| Manual — AM tag tiap video | Akurat | Effort besar, nggak scalable |
| **Hybrid (rekomendasi)** — auto-match + tabel override manual buat kasus aneh | Akurat + hemat effort | Perlu 1 tabel kecil `video_campaign_override` |

**Keputusan:** ______________________

### 8b. Sumber commission rate

`AffiliateDailyFact.commission` sekarang angka jadi. Pertanyaannya: itu **full
dari API affiliate orders**, atau rate-nya dinego per creator/campaign dan
disimpan internal (buat validasi / forecast)?

**Keputusan:** ______________________

---

## 9. Setup kompetisi

Record paling "berat" — dibikin manual tiap kompetisi, sebelum mulai.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `competitionId` | slug unik | `comp-august` | ✅ |
| `name` | nama kompetisi | `August Affiliate Sprint` | ✅ |
| `type` | `MONTHLY_COMPETITION` \| `QUARTERLY_REWARD` \| `DOUBLE_DATE` \| `PAYDAY` | `MONTHLY_COMPETITION` | ✅ |
| `campaignId` | campaign induk (lihat §7) | `campaign-glowbomb` | ✅ |
| `startDate` | `YYYY-MM-DD` — "manual period" mulai | `2026-08-01` | ✅ |
| `endDate` | `YYYY-MM-DD` — "manual period" selesai | `2026-08-28` | ✅ |
| `participantCreatorIds` | list `creatorId` yang ikut (**subset**, bukan semua creator) | `["creator-sissy-0", "creator-aya-3", ...]` | ✅ |
| `requiredHashtags` | aturan hashtag kompetisi — **boleh beda** dari campaign induk | `["#GlowFX", "#GlowBomb", ...]` | ✅ |
| `minimumHashtagMatches` | minimal cocok biar video kompetisi valid | `3` | ✅ |
| *reward tiers* | *(belum dimodelin — tim tetap tracking hadiah di luar dashboard)* | — | — |

- **Owner:** Lead Affiliate · **Cadence:** sekali per kompetisi, **sebelum tanggal mulai**
- **Kode:** `CompetitionPeriod` di `lib/kol/affiliate-types.ts`; ranking di
  `buildCompetitionRows` (metrik = **GMV only**, dibanding rentang tepat
  sebelumnya dengan jumlah hari sama).
- **Dampak dashboard:** tab **Competition** — aside info + tabel ranking peserta.
  Kalau `participantCreatorIds` kosong / `requiredHashtags` salah → tabel kosong.

---

## 10. Snapshot Creator Level bulanan

"Lv. 1"–"Lv. 5" per creator, per bulan. Ini **snapshot resmi bulanan**, bukan
tier follower — diambil dari filter di TikTok Creator Marketplace.

| Field | Format | Contoh | Wajib |
|---|---|---|---|
| `creatorId` | ID internal | `creator-sissy-0` | ✅ |
| `effectiveMonth` | `YYYY-MM` | `2026-08` | ✅ |
| `level` | string `Lv. N` | `Lv. 5` | ✅ |
| `source` | selalu `TIKTOK_MARKETPLACE_FILTER` | `TIKTOK_MARKETPLACE_FILTER` | ✅ |

- **Owner:** Data/ops · **Cadence:** **tiap awal bulan** — export dari Creator
  Marketplace, catat level tiap creator
- **Kode:** `CreatorLevelSnapshot`; lookup di `getCreatorLevel` (ambil snapshot
  terakhir dengan `effectiveMonth <= bulan tanggal yang dilihat`)
- **Dampak dashboard:** kolom **TikTok level** di leaderboard & breakdown; filter
  **TikTok level**. Bulan yang belum diisi → creator kepakai snapshot bulan
  sebelumnya; kalau belum ada sama sekali → "Unavailable".

---

## 11. Opsional / nice-to-have

Belum ada di model data — tambahan kalau mau dashboard lebih kaya.

- **Target / kuota per PIC** — GMV / jumlah creator / jumlah video target per
  periode per AM. Biar kartu PIC bisa nampilin *pacing* ("68% of target", bar
  progress) kayak dashboard media-plan. Full manual, per periode.
- **Status lifecycle creator** — tanggal onboard, status `active` / `paused` /
  `churned` per creator. Sekarang "active affiliate" cuma diinfer dari
  ada-aktivitas-di-periode; dengan status eksplisit bisa lebih akurat + kelihatan
  AM mana yang creatornya banyak nganggur.

---

## 12. Cara ngumpulin (interim)

Sebelum tabel Supabase + admin UI jadi: **satu Google Sheet, satu tab per
dataset.** Header siap-tempel:

```
Tab "pic"                — pic_id | name | avatar_seed
Tab "creator_pic"        — creator_id | username | display_name | pic_id | tags (pisah koma)
Tab "creator_aliases"    — creator_id | alias_username
Tab "campaign"           — campaign_id | name | status | required_hashtags (pisah koma) | minimum_hashtag_matches
Tab "competition"        — competition_id | name | type | campaign_id | start_date | end_date | participant_creator_ids (pisah koma) | required_hashtags (pisah koma) | minimum_hashtag_matches
Tab "creator_level"      — creator_id | effective_month (YYYY-MM) | level
Tab "video_override"     — video_id | campaign_id   (kalau pilih opsi hybrid di §8a)
```

Dari sheet ini nanti tinggal di-import ke Supabase (weekly untuk mapping/alias,
monthly untuk creator_level, ad-hoc untuk campaign/competition).

---

## 13. Referensi kode

| Konsep | File |
|---|---|
| Semua bentuk data (source of truth field) | `lib/kol/affiliate-types.ts` |
| Contoh nilai + hint cadence (komentar) | `lib/kol/affiliate-mock-data.ts` |
| Identity map, unmatched username, validasi hashtag, filter | `lib/kol/affiliate-aggregate.ts` |
| Banner "Data quality", kolom Valid, tabel kompetisi | `app/kol/affiliate-dashboard-sections.tsx` |
| Kartu & breakdown PIC | `app/kol/affiliate-pic-sections.tsx` |
| Filter bar + tab (Ringkasan / Per Creator / Konten / Competition) | `app/kol/page.tsx` |
| Gaya schema buat tabel affiliate nanti | `docs/supabase-schema.sql` |
