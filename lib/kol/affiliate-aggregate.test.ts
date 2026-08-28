import { describe, expect, it } from "vitest";
import {
  bucketStart,
  buildAffiliateOverview,
  buildAffiliatePicBreakdown,
  buildAffiliatePicRows,
  buildCompetitionRows,
  netMerchandiseValue,
  previousPeriod,
  validateVideoHashtags,
} from "@/lib/kol/affiliate-aggregate";
import {
  AffiliateCampaign,
  AffiliateCreatorProfile,
  AffiliateDailyFact,
  AffiliateFilters,
  AffiliatePic,
  AffiliateVideo,
  CompetitionPeriod,
  CreatorLevelSnapshot,
} from "@/lib/kol/affiliate-types";

const creator: AffiliateCreatorProfile = {
  creatorId: "c1",
  creatorOpenId: "open-c1",
  username: "@creator.one",
  usernameAliases: ["@creator.old"],
  displayName: "Creator One",
  avatarSeed: "c1",
  followerCount: 10_000,
  tags: ["Top Seller"],
  pic: "pic-a",
};

const level: CreatorLevelSnapshot = {
  creatorId: "c1",
  effectiveMonth: "2026-08",
  level: "Lv. 3",
  source: "TIKTOK_MARKETPLACE_FILTER",
};

const campaign: AffiliateCampaign = {
  campaignId: "campaign",
  name: "Campaign",
  status: "ACTIVE",
  requiredHashtags: ["#one", "#two", "#three", "#four", "#five"],
  minimumHashtagMatches: 3,
};

function fact(date: string, gmv: number, overrides: Partial<AffiliateDailyFact> = {}): AffiliateDailyFact {
  return {
    date,
    creatorUsername: "@creator.old",
    campaignId: "campaign",
    videoId: "v1",
    channel: "VIDEO",
    gmv,
    cancelledValue: 0,
    returnedValue: 0,
    refundedValue: 0,
    orders: 1,
    commission: gmv * 0.1,
    ...overrides,
  };
}

describe("period aggregation", () => {
  it("builds an equal-length previous period across month boundaries", () => {
    expect(previousPeriod("2026-08-01", "2026-08-07")).toEqual({ startDate: "2026-07-25", endDate: "2026-07-31" });
  });

  it("uses Monday for weekly buckets and calendar-month starts", () => {
    expect(bucketStart("2026-08-09", "weekly")).toBe("2026-08-03");
    expect(bucketStart("2026-08-28", "monthly")).toBe("2026-08-01");
  });

  it("subtracts mutually exclusive adjustments from GMV", () => {
    expect(netMerchandiseValue(fact("2026-08-01", 1_000, { returnedValue: 125 }))).toBe(875);
  });

  it("applies creator level, tag, campaign, and alias identity consistently", () => {
    const videos: AffiliateVideo[] = [{ videoId: "v1", creatorUsername: "@creator.old", campaignId: "campaign", title: "Video", videoPostTime: "2026-08-02", hashtags: ["one", "#two", "#three"] }];
    const overview = buildAffiliateOverview(
      [fact("2026-07-31", 500), fact("2026-08-02", 1_000)],
      videos,
      [creator],
      [campaign],
      [level],
      { startDate: "2026-08-01", endDate: "2026-08-02", grain: "daily", campaignId: "campaign", creatorLevel: "Lv. 3", creatorTag: "Top Seller", query: "creator one" }
    );
    expect(overview.gmv.current).toBe(1_000);
    expect(overview.activeAffiliates.current).toBe(1);
    expect(overview.videoQuantity.current).toBe(1);
    expect(overview.validVideoQuantity.current).toBe(1);
  });
});

describe("hashtag validation", () => {
  it("normalizes casing and #, while duplicates do not count twice", () => {
    const result = validateVideoHashtags(["#ONE", "two", "#three", "#three"], campaign.requiredHashtags, 3);
    expect(result.matchCount).toBe(3);
    expect(result.isValid).toBe(true);
  });

  it("requires exact tokens and supports a custom threshold", () => {
    expect(validateVideoHashtags(["#one-extra", "#two", "#three"], campaign.requiredHashtags, 3).isValid).toBe(false);
    expect(validateVideoHashtags(["#two", "#three"], campaign.requiredHashtags, 2).isValid).toBe(true);
  });
});

describe("competition ranking", () => {
  it("ranks by GMV only and marks growth as new when previous GMV is zero", () => {
    const secondCreator: AffiliateCreatorProfile = { ...creator, creatorId: "c2", creatorOpenId: "open-c2", username: "@creator.two", usernameAliases: [], displayName: "Creator Two" };
    const competition: CompetitionPeriod = { competitionId: "comp", name: "Comp", type: "DOUBLE_DATE", campaignId: "campaign", startDate: "2026-08-08", endDate: "2026-08-08", participantCreatorIds: ["c1", "c2"], requiredHashtags: campaign.requiredHashtags, minimumHashtagMatches: 3 };
    const rows = buildCompetitionRows(
      competition,
      [fact("2026-08-08", 1_000), { ...fact("2026-08-08", 2_000), creatorUsername: "@creator.two", videoId: "v2" }],
      [],
      [creator, secondCreator]
    );
    expect(rows.map((row) => row.creator.creatorId)).toEqual(["c2", "c1"]);
    expect(rows[0].growthPct).toBeNull();
  });
});

describe("pic rollup", () => {
  const picA: AffiliatePic = { picId: "pic-a", name: "PIC A", avatarSeed: "a" };
  const picB: AffiliatePic = { picId: "pic-b", name: "PIC B", avatarSeed: "b" };
  const creatorA: AffiliateCreatorProfile = { ...creator, pic: "pic-a" };
  const creatorB: AffiliateCreatorProfile = {
    ...creator,
    creatorId: "c2",
    creatorOpenId: "open-c2",
    username: "@creator.two",
    usernameAliases: [],
    displayName: "Creator Two",
    pic: "pic-b",
  };
  const levelB: CreatorLevelSnapshot = { ...level, creatorId: "c2" };
  const videos: AffiliateVideo[] = [
    { videoId: "v1", creatorUsername: "@creator.old", campaignId: "campaign", title: "A", videoPostTime: "2026-08-02", hashtags: ["#one", "#two", "#three"] },
    { videoId: "v2", creatorUsername: "@creator.two", campaignId: "campaign", title: "B", videoPostTime: "2026-08-02", hashtags: ["#one", "#two", "#three"] },
  ];
  const facts: AffiliateDailyFact[] = [
    fact("2026-08-02", 1_000), // creatorA video
    { ...fact("2026-08-02", 3_000), creatorUsername: "@creator.two", videoId: "v2" }, // creatorB video
    { ...fact("2026-08-02", 400, { returnedValue: 100 }), videoId: "", channel: "LIVE" }, // creatorA live, nmv 300
    { ...fact("2026-08-03", 500), creatorUsername: "@creator.two", videoId: "", channel: "LIVE" }, // creatorB live
  ];
  const filters: AffiliateFilters = { startDate: "2026-08-01", endDate: "2026-08-03", grain: "daily" };
  const profiles: AffiliateCreatorProfile[] = [creatorA, creatorB];
  const campaigns: AffiliateCampaign[] = [campaign];
  const snapshots: CreatorLevelSnapshot[] = [level, levelB];
  const pics: AffiliatePic[] = [picA, picB];

  it("splits GMV/NMV by channel and counts creators per PIC", () => {
    const rows = buildAffiliatePicRows(facts, videos, profiles, campaigns, snapshots, pics, filters);
    expect(rows.map((row) => row.pic.picId)).toEqual(["pic-b", "pic-a"]); // 3500 > 1400
    const a = rows.find((row) => row.pic.picId === "pic-a")!;
    expect(a.creatorCount).toBe(1);
    expect(a.gmvVideo).toBe(1_000);
    expect(a.gmvLive).toBe(400);
    expect(a.gmv).toBe(1_400);
    expect(a.nmvVideo).toBe(1_000);
    expect(a.nmv).toBe(1_300); // 1000 + (400 - 100)
    expect(a.growthPct).toBeNull(); // previous window empty, current != 0
  });

  it("breakdown lists each creator and reconciles to totals", () => {
    const groups = buildAffiliatePicBreakdown(facts, videos, profiles, campaigns, snapshots, pics, filters);
    const a = groups.find((group) => group.pic.picId === "pic-a")!;
    expect(a.creators).toHaveLength(1);
    expect(a.creators[0].gmv).toBe(a.totals.gmv);
    expect(a.creators[0].gmvLive).toBe(400);
    expect(a.creators[0].gmvVideo).toBe(1_000);
  });
});
