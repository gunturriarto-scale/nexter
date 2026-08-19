-- ============================================================================
-- GLOW FX :: HERMES :: DATA ANALYST — Supabase schema
-- Project: https://ukwaoydxdlzukoitmglh.supabase.co
-- Jalankan di Supabase SQL Editor (satu file, idempotent via create if not exists)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- GMV MAX (TikTok Business API)
-- ---------------------------------------------------------------------------

create table if not exists public.gmv_max_campaigns (
  advertiser_id text not null,
  campaign_id text not null,
  brand text,
  store_id text,
  campaign_name text,
  promotion_type text,             -- PRODUCT_GMV_MAX | LIVE_GMV_MAX
  operation_status text,           -- ENABLE | DISABLE
  secondary_status text,
  objective_type text,
  roi_protection_status text,      -- IN_EFFECT | NOT_ELIGIBLE
  create_time timestamptz,
  modify_time timestamptz,
  updated_at timestamptz not null default now(),
  primary key (advertiser_id, campaign_id)
);

create table if not exists public.gmv_max_report_daily (
  brand text,
  advertiser_id text not null,
  store_id text not null,
  campaign_id text not null,
  promotion_type text not null,    -- PRODUCT_GMV_MAX | LIVE_GMV_MAX
  day date not null,
  item_group_id text not null default '',
  item_id text not null default '',
  room_id text not null default '',
  creative_delivery_status text,
  currency text,
  cost numeric not null default 0,
  net_cost numeric not null default 0,
  orders numeric not null default 0,
  cost_per_order numeric not null default 0,
  gross_revenue numeric not null default 0,
  roi numeric not null default 0,
  product_impressions numeric not null default 0,
  product_clicks numeric not null default 0,
  product_click_rate numeric not null default 0,
  ad_click_rate numeric not null default 0,
  ad_conversion_rate numeric not null default 0,
  ad_video_view_rate_2s numeric not null default 0,
  ad_video_view_rate_6s numeric not null default 0,
  ad_video_view_rate_p25 numeric not null default 0,
  ad_video_view_rate_p50 numeric not null default 0,
  ad_video_view_rate_p75 numeric not null default 0,
  ad_video_view_rate_p100 numeric not null default 0,
  live_views numeric,
  cost_per_live_view numeric,
  live_views_10s numeric,
  live_follows numeric,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, day, item_group_id, item_id, room_id)
);

create index if not exists idx_gmv_max_report_day on public.gmv_max_report_daily(day);
create index if not exists idx_gmv_max_report_brand on public.gmv_max_report_daily(brand);

-- ---------------------------------------------------------------------------
-- KALODATA (Market Intelligence)
-- ---------------------------------------------------------------------------

create table if not exists public.kalodata_shops (
  shop_id text primary key,
  region text,
  shop_name text,
  revenue numeric,
  sales_volumn numeric,
  unit_price numeric,
  creator_number numeric,
  product_number numeric,
  video_number numeric,
  live_number numeric,
  affiliate_revenue numeric,
  self_account_revenue numeric,
  shopping_mall_revenue numeric,
  top3_product_ids jsonb,
  seller_type text,
  fetched_at timestamptz not null default now()
);

create table if not exists public.kalodata_products (
  product_id text primary key,
  region text,
  product_name text,
  shop_id text,
  revenue numeric,
  sales_volumn numeric,
  unit_price numeric,
  commission_rate numeric,
  video_revenue numeric,
  live_revenue numeric,
  product_review_count numeric,
  launch_date date,
  category_name text,
  fetched_at timestamptz not null default now()
);

create table if not exists public.kalodata_creators (
  creator_id text primary key,
  region text,
  creator_nickname text,
  creator_handle text,
  creator_status text,
  revenue numeric,
  creator_followers numeric,
  content_views numeric,
  video_revenue numeric,
  live_revenue numeric,
  engagement_rate numeric,
  fetched_at timestamptz not null default now()
);

create table if not exists public.kalodata_videos (
  video_id text primary key,
  region text,
  video_title text,
  shop_name text,
  revenue numeric,
  views numeric,
  ads_roas numeric,
  video_gpm numeric,
  is_ad boolean,
  fetched_at timestamptz not null default now()
);

create table if not exists public.kalodata_categories (
  category_id text primary key,
  region text,
  category_name text,
  revenue numeric,
  revenue_growth_rate numeric,
  top3_shop_revenue_ratio numeric,
  fetched_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- KOL (ScrapeCreators)
-- ---------------------------------------------------------------------------

create table if not exists public.kol_creators (
  creator_id text primary key,
  brand text,
  username text,
  display_name text,
  category text,
  authorization_type text,
  follower_count numeric,
  source text,
  product_focus text,
  updated_at timestamptz not null default now()
);

create table if not exists public.kol_tracked_posts (
  post_id text primary key,
  brand text,
  creator_id text,
  post_url text,
  caption text,
  added_by text,
  posted_at timestamptz,
  last_synced_at timestamptz,
  sync_status text,
  views numeric,
  likes numeric,
  comments numeric,
  shares numeric,
  updated_at timestamptz not null default now()
);

-- snapshot history buat sparkline + growth WoW
create table if not exists public.kol_post_snapshots (
  id bigserial primary key,
  post_id text not null,
  views numeric not null,
  likes numeric not null,
  comments numeric not null,
  shares numeric not null,
  captured_at timestamptz not null default now()
);
create index if not exists idx_kol_snapshots_post on public.kol_post_snapshots(post_id, captured_at);

-- ---------------------------------------------------------------------------
-- LOSS ANALYSIS (TikTok Shop Seller API)
-- ---------------------------------------------------------------------------

create table if not exists public.cancellations (
  cancel_id text primary key,
  brand text,
  order_id text,
  cancel_type text,
  cancel_status text,
  role text,
  cancel_reason text,
  cancel_reason_text text,
  create_time timestamptz,
  update_time timestamptz,
  seller_next_action jsonb,
  refund_total numeric,
  refund_subtotal numeric,
  refund_shipping_fee numeric,
  refund_tax numeric,
  should_replenish_stock boolean,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SHOPEE (source ke-5) — full schema untuk /shopee dashboard (lihat
-- docs/shopee-open-api.md buat referensi endpoint & docs/shopee-open-api.md
-- checklist go-live). Wave 1 = tabel dibuat kosong, dipakai mulai Wave 2+
-- begitu dev account approved dan sync route jalan.
-- ---------------------------------------------------------------------------

-- Kredensial per-shop — paling sensitif di schema ini, service-role only,
-- jangan pernah di-expose ke client atau di-log.
create table if not exists public.shopee_shops (
  shop_id text primary key,
  shop_name text,
  brand text,
  region text,
  merchant_id text,
  access_token text,
  refresh_token text,
  token_expire_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.shopee_orders (
  order_sn text primary key,
  shop_id text,
  order_status text,
  create_time timestamptz,
  update_time timestamptz,
  pay_time timestamptz,
  ship_by_date timestamptz,
  total_amount numeric,
  currency text,
  buyer_username text,
  item_count numeric,
  cancel_reason text,
  shipping_carrier text,
  actual_shipping_fee numeric,
  escrow_amount numeric,
  updated_at timestamptz not null default now()
);
create index if not exists idx_shopee_orders_status on public.shopee_orders(order_status);
create index if not exists idx_shopee_orders_create_time on public.shopee_orders(create_time);

create table if not exists public.shopee_order_items (
  order_sn text not null,
  item_id text not null,
  model_id text not null,
  item_name text,
  model_name text,
  quantity_purchased numeric,
  item_price numeric,
  discounted_price numeric,
  primary key (order_sn, item_id, model_id)
);

create table if not exists public.shopee_returns (
  return_sn text primary key,
  order_sn text,
  shop_id text,
  status text,
  reason text,
  refund_amount numeric,
  negotiation_status text,
  create_time timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.shopee_products (
  item_id text primary key,
  shop_id text,
  item_name text,
  item_sku text,
  category_id text,
  price numeric,
  stock numeric,
  item_status text,
  views numeric,
  likes numeric,
  sales numeric,
  rating_star numeric,
  create_time timestamptz,
  update_time timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.shopee_product_models (
  item_id text not null,
  model_id text not null,
  model_name text,
  model_sku text,
  price numeric,
  stock numeric,
  updated_at timestamptz not null default now(),
  primary key (item_id, model_id)
);

create table if not exists public.shopee_ads_performance (
  id bigserial primary key,
  shop_id text not null,
  metric_date date not null,
  campaign_id text,
  campaign_name text,
  ad_type text,
  cost numeric,
  gmv numeric,
  roi numeric,
  orders numeric,
  impressions numeric,
  clicks numeric,
  ctr numeric,
  conversion numeric,
  direct_orders numeric,
  broad_orders numeric,
  direct_gmv numeric,
  broad_gmv numeric,
  updated_at timestamptz not null default now(),
  unique (shop_id, metric_date, campaign_id)
);

create table if not exists public.shopee_ads_affiliate_performance (
  affiliate_id text not null,
  metric_date date not null,
  affiliate_name text,
  clicks numeric,
  orders numeric,
  gmv numeric,
  commission numeric,
  updated_at timestamptz not null default now(),
  primary key (affiliate_id, metric_date)
);

create table if not exists public.shopee_account_health (
  shop_id text not null,
  metric_date date not null,
  penalty_points numeric,
  late_order_rate numeric,
  non_fulfillment_rate numeric,
  listing_violation_count numeric,
  response_rate numeric,
  updated_at timestamptz not null default now(),
  primary key (shop_id, metric_date)
);

create table if not exists public.shopee_livestream_sessions (
  session_id text primary key,
  shop_id text,
  title text,
  start_time timestamptz,
  end_time timestamptz,
  views numeric,
  gmv numeric,
  orders numeric,
  avg_watch_time numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.shopee_videos (
  video_id text primary key,
  shop_id text,
  title text,
  publish_time timestamptz,
  views numeric,
  likes numeric,
  gmv numeric,
  orders numeric,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RLS: semua tabel di atas server-only (no public read) — akses lewat service role
-- ============================================================================
alter table public.gmv_max_campaigns enable row level security;
alter table public.gmv_max_report_daily enable row level security;
alter table public.kalodata_shops enable row level security;
alter table public.kalodata_products enable row level security;
alter table public.kalodata_creators enable row level security;
alter table public.kalodata_videos enable row level security;
alter table public.kalodata_categories enable row level security;
alter table public.kol_creators enable row level security;
alter table public.kol_tracked_posts enable row level security;
alter table public.kol_post_snapshots enable row level security;
alter table public.cancellations enable row level security;
alter table public.shopee_shops enable row level security;
alter table public.shopee_orders enable row level security;
alter table public.shopee_order_items enable row level security;
alter table public.shopee_returns enable row level security;
alter table public.shopee_products enable row level security;
alter table public.shopee_product_models enable row level security;
alter table public.shopee_ads_performance enable row level security;
alter table public.shopee_ads_affiliate_performance enable row level security;
alter table public.shopee_account_health enable row level security;
alter table public.shopee_livestream_sessions enable row level security;
alter table public.shopee_videos enable row level security;
