import {
  AffiliateCampaign,
  AffiliateCreatorProfile,
  AffiliateDailyFact,
  AffiliatePic,
  AffiliateVideo,
  CompetitionPeriod,
  CreatorLevelSnapshot,
} from "@/lib/kol/affiliate-types";

// ---------------------------------------------------------------------------
// PIC roster — affiliate managers who own the creators they onboarded.
// ---------------------------------------------------------------------------
export const MOCK_AFFILIATE_PICS: AffiliatePic[] = [
  { picId: "pic-sissy", name: "Sissy", avatarSeed: "sissy" },
  { picId: "pic-aya", name: "Aya", avatarSeed: "aya" },
  { picId: "pic-khalda", name: "Khalda", avatarSeed: "khalda" },
  { picId: "pic-winda", name: "Winda", avatarSeed: "winda" },
];

// Creators owned per PIC (each within the 10-20 range agreed for the mock set).
const CREATORS_PER_PIC = [15, 12, 18, 14];

const HANDLE_PREFIX = ["kulit", "glow", "serum", "derma", "rice", "skin", "beauty", "nara", "aura", "dewi"];
const HANDLE_CORE = ["sehat", "cerah", "diary", "story", "lab", "daily", "review", "space"];
const HANDLE_TLD = ["id", "beauty", "co", "official", "care", "web"];
const DISPLAY_PREFIX = ["Kulit", "Glow", "Serum", "Derma", "Rice", "Skin", "Beauty", "Nara", "Aura", "Dewi"];
const DISPLAY_CORE = ["Sehat", "Cerah", "Diary", "Story", "Lab", "Daily", "Review", "Space"];
const TAG_POOL = ["Top Seller", "Rising Star", "New Affiliate", "Beauty Expert", "Video-focused"];
const VIDEO_TITLES = [
  "Before & after 14 hari pakai serum",
  "Racun skincare yang beneran works",
  "Morning routine buat barrier + glow",
  "Texture check & first impression",
  "Haul checkout keranjang orange",
  "Rekomendasi skincare under 200k",
  "Rutin malam buat kulit kusam",
  "Review jujur setelah sebulan",
];

function levelNumber(followerCount: number): number {
  if (followerCount >= 500_000) return 5;
  if (followerCount >= 200_000) return 4;
  if (followerCount >= 50_000) return 3;
  if (followerCount >= 10_000) return 2;
  return 1;
}

function makeCreators(): AffiliateCreatorProfile[] {
  const creators: AffiliateCreatorProfile[] = [];
  let g = 0;
  for (const [picIndex, count] of CREATORS_PER_PIC.entries()) {
    const pic = MOCK_AFFILIATE_PICS[picIndex];
    for (let i = 0; i < count; i += 1) {
      const pfx = g % HANDLE_PREFIX.length;
      const core = Math.floor(g / HANDLE_PREFIX.length) % HANDLE_CORE.length;
      const tld = Math.floor(g / (HANDLE_PREFIX.length * HANDLE_CORE.length)) % HANDLE_TLD.length;
      const handle = `${HANDLE_PREFIX[pfx]}${HANDLE_CORE[core]}.${HANDLE_TLD[tld]}`;
      const followerCount = 3_000 + ((g * 37) % 100) * 9_000;
      const tags = Array.from(
        new Set(g % 3 === 0 ? [TAG_POOL[g % TAG_POOL.length], TAG_POOL[(g + 2) % TAG_POOL.length]] : [TAG_POOL[g % TAG_POOL.length]])
      );
      creators.push({
        creatorId: `creator-${pic.picId.slice(4)}-${i}`,
        creatorOpenId: `coid-${pic.picId.slice(4)}-${i}`,
        username: `@${handle}`,
        usernameAliases: g === 0 ? [`@${HANDLE_PREFIX[pfx]}${HANDLE_CORE[core]}.alt`] : [],
        displayName: `${DISPLAY_PREFIX[pfx]} ${DISPLAY_CORE[core]}`,
        avatarSeed: handle,
        followerCount,
        tags,
        pic: pic.picId,
      });
      g += 1;
    }
  }
  return creators;
}

export const MOCK_AFFILIATE_PROFILES: AffiliateCreatorProfile[] = makeCreators();

function makeLevelSnapshots(creators: AffiliateCreatorProfile[]): CreatorLevelSnapshot[] {
  return creators.flatMap((creator) => {
    const level = levelNumber(creator.followerCount);
    return [
      { effectiveMonth: "2026-07", creatorId: creator.creatorId, level: `Lv. ${Math.max(1, level - 1)}`, source: "TIKTOK_MARKETPLACE_FILTER" as const },
      { effectiveMonth: "2026-08", creatorId: creator.creatorId, level: `Lv. ${level}`, source: "TIKTOK_MARKETPLACE_FILTER" as const },
    ];
  });
}

export const MOCK_CREATOR_LEVEL_SNAPSHOTS: CreatorLevelSnapshot[] = makeLevelSnapshots(MOCK_AFFILIATE_PROFILES);

export const MOCK_AFFILIATE_CAMPAIGNS: AffiliateCampaign[] = [
  {
    campaignId: "campaign-glowbomb",
    name: "Glow Bomb Always-on",
    status: "ACTIVE",
    requiredHashtags: ["#GlowFX", "#GlowBomb", "#KulitCerah", "#SerumLokal", "#RacunSkincare"],
    minimumHashtagMatches: 3,
  },
  {
    campaignId: "campaign-88",
    name: "Glow FX 8.8",
    status: "ENDED",
    requiredHashtags: ["#GlowFX", "#GlowFX88", "#TikTokShop88", "#SkincareSale", "#RacunTikTok"],
    minimumHashtagMatches: 3,
  },
  {
    campaignId: "campaign-payday",
    name: "Payday Glow Deals",
    status: "ACTIVE",
    requiredHashtags: ["#GlowFX", "#GlowPayday", "#PaydaySale", "#SkincareRoutine", "#TikTokShop"],
    minimumHashtagMatches: 3,
  },
];

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

const VIDEO_POST_DATES = dateRange("2026-07-04", "2026-08-27");

function makeVideos(creators: AffiliateCreatorProfile[]): AffiliateVideo[] {
  const videos: AffiliateVideo[] = [];
  for (const [g, creator] of creators.entries()) {
    const videoCount = 1 + (g % 4); // 1..4
    for (let k = 0; k < videoCount; k += 1) {
      const campaign = MOCK_AFFILIATE_CAMPAIGNS[(g + k) % MOCK_AFFILIATE_CAMPAIGNS.length];
      const postIndex = (g * 7 + k * 13) % VIDEO_POST_DATES.length;
      const keep = (g + k) % 6 === 0 ? 2 : 3 + ((g + k) % 3); // ~1 in 6 videos is invalid
      videos.push({
        videoId: `av-${creator.creatorId}-${k}`,
        creatorUsername: g === 0 && k === 0 && creator.usernameAliases.length > 0 ? creator.usernameAliases[0] : creator.username,
        campaignId: campaign.campaignId,
        title: VIDEO_TITLES[(g + k) % VIDEO_TITLES.length],
        videoPostTime: VIDEO_POST_DATES[postIndex],
        hashtags: campaign.requiredHashtags.slice(0, keep),
      });
    }
  }
  return videos;
}

export const MOCK_AFFILIATE_VIDEOS: AffiliateVideo[] = makeVideos(MOCK_AFFILIATE_PROFILES);

function pickParticipants(predicate: (index: number) => boolean): string[] {
  return MOCK_AFFILIATE_PROFILES.filter((_, index) => predicate(index)).map((creator) => creator.creatorId);
}

export const MOCK_COMPETITIONS: CompetitionPeriod[] = [
  { competitionId: "comp-august", name: "August Affiliate Sprint", type: "MONTHLY_COMPETITION", campaignId: "campaign-glowbomb", startDate: "2026-08-01", endDate: "2026-08-28", participantCreatorIds: MOCK_AFFILIATE_PROFILES.map((creator) => creator.creatorId), requiredHashtags: MOCK_AFFILIATE_CAMPAIGNS[0].requiredHashtags, minimumHashtagMatches: 3 },
  { competitionId: "comp-q3", name: "Q3 Creator Reward", type: "QUARTERLY_REWARD", campaignId: "campaign-glowbomb", startDate: "2026-07-01", endDate: "2026-08-28", participantCreatorIds: pickParticipants((index) => index % 2 === 0), requiredHashtags: MOCK_AFFILIATE_CAMPAIGNS[0].requiredHashtags, minimumHashtagMatches: 3 },
  { competitionId: "comp-88", name: "8.8 Double Date Race", type: "DOUBLE_DATE", campaignId: "campaign-88", startDate: "2026-08-05", endDate: "2026-08-10", participantCreatorIds: pickParticipants((index) => index % 3 === 1), requiredHashtags: MOCK_AFFILIATE_CAMPAIGNS[1].requiredHashtags, minimumHashtagMatches: 3 },
  { competitionId: "comp-payday", name: "Payday Glow Challenge", type: "PAYDAY", campaignId: "campaign-payday", startDate: "2026-08-23", endDate: "2026-08-28", participantCreatorIds: pickParticipants((index) => index % 4 === 2), requiredHashtags: MOCK_AFFILIATE_CAMPAIGNS[2].requiredHashtags, minimumHashtagMatches: 3 },
];

const FACT_DAYS = dateRange("2026-06-01", "2026-08-28");
const LIVE_DAYS = dateRange("2026-06-15", "2026-08-28");

function makeVideoFacts(creators: AffiliateCreatorProfile[], videos: AffiliateVideo[]): AffiliateDailyFact[] {
  const followerByUsername = new Map(creators.flatMap((c) => [c.username, ...c.usernameAliases].map((name) => [name, c.followerCount])));
  const facts: AffiliateDailyFact[] = [];
  for (const [videoIndex, video] of videos.entries()) {
    const followerCount = followerByUsername.get(video.creatorUsername) ?? 60_000;
    const creatorScale = 0.3 + Math.min(2.4, followerCount / 320_000);
    for (const [dateIndex, date] of FACT_DAYS.entries()) {
      if (date < video.videoPostTime) continue;
      const age = Math.floor((new Date(`${date}T00:00:00Z`).getTime() - new Date(`${video.videoPostTime}T00:00:00Z`).getTime()) / 86_400_000);
      const launchLift = Math.max(0.26, 1.45 - age * 0.035);
      const weekendLift = [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()) ? 1.18 : 1;
      const wave = 0.86 + ((dateIndex * 7 + videoIndex * 11) % 23) / 50;
      const campaignLift = video.campaignId === "campaign-88" ? 1.35 : video.campaignId === "campaign-payday" ? 1.22 : 1;
      const gmv = Math.round(2_450_000 * creatorScale * launchLift * weekendLift * wave * campaignLift);
      const adjustmentKind = (dateIndex + videoIndex * 3) % 17;
      facts.push({
        date,
        creatorUsername: video.creatorUsername,
        campaignId: video.campaignId,
        videoId: video.videoId,
        channel: "VIDEO",
        gmv,
        cancelledValue: adjustmentKind === 3 ? Math.round(gmv * 0.045) : 0,
        returnedValue: adjustmentKind === 8 ? Math.round(gmv * 0.032) : 0,
        refundedValue: adjustmentKind === 13 ? Math.round(gmv * 0.025) : 0,
        orders: Math.max(1, Math.round(gmv / 128_000)),
        commission: Math.round(gmv * (0.11 + (videoIndex % 4) * 0.01)),
      });
    }
  }
  // Deliberately unmatched username so DataQualityNotice keeps exercising its path.
  facts.push({ date: "2026-08-18", creatorUsername: "@handle.not.mapped", campaignId: "campaign-glowbomb", videoId: "orphan-video", channel: "VIDEO", gmv: 1_250_000, cancelledValue: 0, returnedValue: 0, refundedValue: 0, orders: 8, commission: 137_500 });
  return facts;
}

const LIVE_CAMPAIGNS = ["campaign-glowbomb", "campaign-payday"];

function makeLiveFacts(creators: AffiliateCreatorProfile[]): AffiliateDailyFact[] {
  const facts: AffiliateDailyFact[] = [];
  for (const [g, creator] of creators.entries()) {
    const creatorScale = 0.3 + Math.min(2, creator.followerCount / 360_000);
    const sessionDays = [(g + 1) % 7, (g + 3) % 7, (g + 5) % 7];
    for (const [dateIndex, date] of LIVE_DAYS.entries()) {
      const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
      if (!sessionDays.includes(dow)) continue;
      const weekendLift = [0, 6].includes(dow) ? 1.12 : 1;
      const wave = 0.8 + ((dateIndex * 5 + g * 13) % 21) / 40;
      const gmv = Math.round(1_650_000 * creatorScale * weekendLift * wave);
      const adj = (dateIndex + g * 4) % 19;
      facts.push({
        date,
        creatorUsername: creator.username,
        campaignId: LIVE_CAMPAIGNS[(g + dateIndex) % LIVE_CAMPAIGNS.length],
        videoId: "",
        channel: "LIVE",
        gmv,
        cancelledValue: adj === 4 ? Math.round(gmv * 0.05) : 0,
        returnedValue: adj === 11 ? Math.round(gmv * 0.03) : 0,
        refundedValue: 0,
        orders: Math.max(1, Math.round(gmv / 145_000)),
        commission: Math.round(gmv * 0.09),
      });
    }
  }
  return facts;
}

// GMV attributed to the product card / anchor on content (a placement distinct
// from the video body and from LIVE). Smaller, steadier stream per creator.
function makeProductCardFacts(creators: AffiliateCreatorProfile[]): AffiliateDailyFact[] {
  const facts: AffiliateDailyFact[] = [];
  for (const [g, creator] of creators.entries()) {
    const creatorScale = 0.3 + Math.min(1.8, creator.followerCount / 400_000);
    for (const [dateIndex, date] of LIVE_DAYS.entries()) {
      if ((dateIndex + g) % 2 !== 0) continue; // roughly every other day
      const weekendLift = [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay()) ? 1.08 : 1;
      const wave = 0.82 + ((dateIndex * 3 + g * 7) % 17) / 45;
      const gmv = Math.round(1_180_000 * creatorScale * weekendLift * wave);
      const adj = (dateIndex + g * 5) % 21;
      facts.push({
        date,
        creatorUsername: creator.username,
        campaignId: LIVE_CAMPAIGNS[(g + dateIndex + 1) % LIVE_CAMPAIGNS.length],
        videoId: "",
        channel: "PRODUCT_CARD",
        gmv,
        cancelledValue: adj === 6 ? Math.round(gmv * 0.04) : 0,
        returnedValue: adj === 15 ? Math.round(gmv * 0.028) : 0,
        refundedValue: 0,
        orders: Math.max(1, Math.round(gmv / 150_000)),
        commission: Math.round(gmv * 0.08),
      });
    }
  }
  return facts;
}

// Combined VIDEO + LIVE + PRODUCT_CARD stream. Existing builders sum every scoped
// fact, so affiliate GMV / NMV / trend / leaderboard reflect all channels together.
export const MOCK_AFFILIATE_DAILY_FACTS: AffiliateDailyFact[] = [
  ...makeVideoFacts(MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_VIDEOS),
  ...makeLiveFacts(MOCK_AFFILIATE_PROFILES),
  ...makeProductCardFacts(MOCK_AFFILIATE_PROFILES),
];
