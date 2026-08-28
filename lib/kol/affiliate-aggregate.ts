import {
  AffiliateCampaign,
  AffiliateCreatorProfile,
  AffiliateCreatorRow,
  AffiliateDailyFact,
  AffiliateFilters,
  AffiliateOverviewMetrics,
  AffiliatePic,
  AffiliatePicCreatorRow,
  AffiliatePicRow,
  AffiliateTimeGrain,
  AffiliateTrendPoint,
  AffiliateVideo,
  AffiliateVideoRow,
  CompetitionCreatorRow,
  CompetitionPeriod,
  CreatorLevelSnapshot,
  MetricValue,
} from "@/lib/kol/affiliate-types";

const DAY_MS = 86_400_000;

function asDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function addDays(value: string, amount: number): string {
  const date = asDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function previousPeriod(startDate: string, endDate: string) {
  const dayCount = Math.floor((asDate(endDate).getTime() - asDate(startDate).getTime()) / DAY_MS) + 1;
  return {
    startDate: addDays(startDate, -dayCount),
    endDate: addDays(startDate, -1),
  };
}

export function netMerchandiseValue(fact: AffiliateDailyFact): number {
  return Math.max(0, fact.gmv - fact.cancelledValue - fact.returnedValue - fact.refundedValue);
}

export function normalizeUsername(value: string): string {
  const trimmed = value.trim().toLocaleLowerCase("en-US");
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function buildCreatorIdentityMap(creators: AffiliateCreatorProfile[]) {
  const map = new Map<string, AffiliateCreatorProfile>();
  for (const creator of creators) {
    for (const username of [creator.username, ...creator.usernameAliases]) {
      map.set(normalizeUsername(username), creator);
    }
  }
  return map;
}

export function normalizeHashtag(value: string): string {
  return value.trim().replace(/^#+/, "").toLocaleLowerCase("en-US");
}

export function validateVideoHashtags(
  videoHashtags: string[],
  requiredHashtags: string[],
  minimumMatches: number
) {
  const videoTokens = new Set(videoHashtags.map(normalizeHashtag).filter(Boolean));
  const requiredTokens = Array.from(new Set(requiredHashtags.map(normalizeHashtag).filter(Boolean)));
  const matchedHashtags = requiredTokens.filter((hashtag) => videoTokens.has(hashtag));
  return {
    matchedHashtags: matchedHashtags.map((hashtag) => `#${hashtag}`),
    matchCount: matchedHashtags.length,
    isValid: minimumMatches > 0 && matchedHashtags.length >= minimumMatches,
  };
}

export function getCreatorLevel(
  creatorId: string,
  atDate: string,
  snapshots: CreatorLevelSnapshot[]
): string | null {
  const month = atDate.slice(0, 7);
  const match = snapshots
    .filter((snapshot) => snapshot.creatorId === creatorId && snapshot.effectiveMonth <= month)
    .sort((a, b) => b.effectiveMonth.localeCompare(a.effectiveMonth))[0];
  return match?.level ?? null;
}

function inRange(value: string, startDate: string, endDate: string): boolean {
  return value >= startDate && value <= endDate;
}

export function growthPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function metric(current: number, previous: number): MetricValue {
  return { current, previous, growthPct: growthPct(current, previous) };
}

function creatorMatches(
  creator: AffiliateCreatorProfile,
  filters: AffiliateFilters,
  snapshots: CreatorLevelSnapshot[]
): boolean {
  const query = filters.query?.trim().toLocaleLowerCase("id-ID");
  if (query && !`${creator.displayName} ${creator.username}`.toLocaleLowerCase("id-ID").includes(query)) return false;
  if (filters.creatorTag && !creator.tags.includes(filters.creatorTag)) return false;
  if (filters.creatorLevel && getCreatorLevel(creator.creatorId, filters.endDate, snapshots) !== filters.creatorLevel) return false;
  return true;
}

export function filterFacts(
  facts: AffiliateDailyFact[],
  creators: AffiliateCreatorProfile[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters,
  startDate: string,
  endDate: string
) {
  const identityMap = buildCreatorIdentityMap(creators);
  const eligibleIds = new Set(
    creators.filter((creator) => creatorMatches(creator, filters, snapshots)).map((creator) => creator.creatorId)
  );
  return facts.filter((fact) => {
    const creator = identityMap.get(normalizeUsername(fact.creatorUsername));
    return Boolean(
      creator &&
        eligibleIds.has(creator.creatorId) &&
        inRange(fact.date, startDate, endDate) &&
        (!filters.campaignId || fact.campaignId === filters.campaignId)
    );
  });
}

function filterVideos(
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters,
  startDate: string,
  endDate: string
) {
  const identityMap = buildCreatorIdentityMap(creators);
  const eligibleIds = new Set(
    creators.filter((creator) => creatorMatches(creator, filters, snapshots)).map((creator) => creator.creatorId)
  );
  return videos.filter((video) => {
    const creator = identityMap.get(normalizeUsername(video.creatorUsername));
    return Boolean(
      creator &&
        eligibleIds.has(creator.creatorId) &&
        inRange(video.videoPostTime, startDate, endDate) &&
        (!filters.campaignId || video.campaignId === filters.campaignId)
    );
  });
}

function validVideoIds(videos: AffiliateVideo[], campaigns: AffiliateCampaign[]): Set<string> {
  const campaignMap = new Map(campaigns.map((campaign) => [campaign.campaignId, campaign]));
  return new Set(
    videos
      .filter((video) => {
        const campaign = campaignMap.get(video.campaignId);
        return campaign
          ? validateVideoHashtags(video.hashtags, campaign.requiredHashtags, campaign.minimumHashtagMatches).isValid
          : false;
      })
      .map((video) => video.videoId)
  );
}

function totals(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  campaigns: AffiliateCampaign[],
  creators: AffiliateCreatorProfile[]
) {
  const identityMap = buildCreatorIdentityMap(creators);
  const creatorIdOf = (username: string) => identityMap.get(normalizeUsername(username))?.creatorId;
  const gmvByChannel = (channel: AffiliateDailyFact["channel"]) =>
    facts.reduce((sum, fact) => (fact.channel === channel ? sum + fact.gmv : sum), 0);
  return {
    gmv: facts.reduce((sum, fact) => sum + fact.gmv, 0),
    nmv: facts.reduce((sum, fact) => sum + netMerchandiseValue(fact), 0),
    gmvVideo: gmvByChannel("VIDEO"),
    gmvLive: gmvByChannel("LIVE"),
    gmvProductCard: gmvByChannel("PRODUCT_CARD"),
    activeAffiliates: new Set(facts.flatMap((fact) => (creatorIdOf(fact.creatorUsername) ? [creatorIdOf(fact.creatorUsername)!] : []))).size,
    liveStreamers: new Set(
      facts.flatMap((fact) => (fact.channel === "LIVE" && creatorIdOf(fact.creatorUsername) ? [creatorIdOf(fact.creatorUsername)!] : []))
    ).size,
    videoQuantity: new Set(videos.map((video) => video.videoId)).size,
    validVideoQuantity: validVideoIds(videos, campaigns).size,
    orders: facts.reduce((sum, fact) => sum + fact.orders, 0),
    commission: facts.reduce((sum, fact) => sum + fact.commission, 0),
  };
}

export function buildAffiliateOverview(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters
): AffiliateOverviewMetrics {
  const previous = previousPeriod(filters.startDate, filters.endDate);
  const currentTotals = totals(
    filterFacts(facts, creators, snapshots, filters, filters.startDate, filters.endDate),
    filterVideos(videos, creators, snapshots, filters, filters.startDate, filters.endDate),
    campaigns,
    creators
  );
  const previousTotals = totals(
    filterFacts(facts, creators, snapshots, filters, previous.startDate, previous.endDate),
    filterVideos(videos, creators, snapshots, filters, previous.startDate, previous.endDate),
    campaigns,
    creators
  );
  return {
    gmv: metric(currentTotals.gmv, previousTotals.gmv),
    nmv: metric(currentTotals.nmv, previousTotals.nmv),
    gmvVideo: metric(currentTotals.gmvVideo, previousTotals.gmvVideo),
    gmvLive: metric(currentTotals.gmvLive, previousTotals.gmvLive),
    gmvProductCard: metric(currentTotals.gmvProductCard, previousTotals.gmvProductCard),
    activeAffiliates: metric(currentTotals.activeAffiliates, previousTotals.activeAffiliates),
    liveStreamers: metric(currentTotals.liveStreamers, previousTotals.liveStreamers),
    videoQuantity: metric(currentTotals.videoQuantity, previousTotals.videoQuantity),
    validVideoQuantity: metric(currentTotals.validVideoQuantity, previousTotals.validVideoQuantity),
    orders: metric(currentTotals.orders, previousTotals.orders),
    commission: metric(currentTotals.commission, previousTotals.commission),
  };
}

export function bucketStart(dateValue: string, grain: AffiliateTimeGrain): string {
  if (grain === "daily") return dateValue;
  if (grain === "monthly") return `${dateValue.slice(0, 7)}-01`;
  const date = asDate(dateValue);
  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

function bucketLabel(bucket: string, grain: AffiliateTimeGrain): string {
  const date = asDate(bucket);
  if (grain === "daily") return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" }).format(date);
  if (grain === "weekly") return `W ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" }).format(date)}`;
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "Asia/Jakarta" }).format(date);
}

export function buildAffiliateTrend(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters
): AffiliateTrendPoint[] {
  const scopedFacts = filterFacts(facts, creators, snapshots, filters, filters.startDate, filters.endDate);
  const scopedVideos = filterVideos(videos, creators, snapshots, filters, filters.startDate, filters.endDate);
  const validIds = validVideoIds(scopedVideos, campaigns);
  const buckets = new Map<string, AffiliateTrendPoint>();
  const ensure = (value: string) => {
    const bucket = bucketStart(value, filters.grain);
    if (!buckets.has(bucket)) buckets.set(bucket, { bucket, label: bucketLabel(bucket, filters.grain), gmv: 0, nmv: 0, orders: 0, validVideos: 0 });
    return buckets.get(bucket)!;
  };
  for (const fact of scopedFacts) {
    const point = ensure(fact.date);
    point.gmv += fact.gmv;
    point.nmv += netMerchandiseValue(fact);
    point.orders += fact.orders;
  }
  for (const video of scopedVideos) {
    const point = ensure(video.videoPostTime);
    if (validIds.has(video.videoId)) point.validVideos += 1;
  }
  return [...buckets.values()].sort((a, b) => a.bucket.localeCompare(b.bucket));
}

export function buildAffiliateCreatorRows(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters
): AffiliateCreatorRow[] {
  const previous = previousPeriod(filters.startDate, filters.endDate);
  const identityMap = buildCreatorIdentityMap(creators);
  const currentFacts = filterFacts(facts, creators, snapshots, filters, filters.startDate, filters.endDate);
  const previousFacts = filterFacts(facts, creators, snapshots, filters, previous.startDate, previous.endDate);
  const currentVideos = filterVideos(videos, creators, snapshots, filters, filters.startDate, filters.endDate);
  const validIds = validVideoIds(currentVideos, campaigns);
  return creators
    .filter((creator) => creatorMatches(creator, filters, snapshots))
    .map((creator) => {
      const belongsToCreator = (username: string) => identityMap.get(normalizeUsername(username))?.creatorId === creator.creatorId;
      const creatorFacts = currentFacts.filter((fact) => belongsToCreator(fact.creatorUsername));
      const creatorPreviousFacts = previousFacts.filter((fact) => belongsToCreator(fact.creatorUsername));
      const creatorVideos = currentVideos.filter((video) => belongsToCreator(video.creatorUsername));
      const gmv = creatorFacts.reduce((sum, fact) => sum + fact.gmv, 0);
      const previousGmv = creatorPreviousFacts.reduce((sum, fact) => sum + fact.gmv, 0);
      return {
        creator,
        level: getCreatorLevel(creator.creatorId, filters.endDate, snapshots),
        videoQuantity: new Set(creatorVideos.map((video) => video.videoId)).size,
        validVideoQuantity: new Set(creatorVideos.filter((video) => validIds.has(video.videoId)).map((video) => video.videoId)).size,
        gmv,
        nmv: creatorFacts.reduce((sum, fact) => sum + netMerchandiseValue(fact), 0),
        commission: creatorFacts.reduce((sum, fact) => sum + fact.commission, 0),
        growthPct: growthPct(gmv, previousGmv),
      };
    })
    .filter((row) => row.gmv > 0 || row.videoQuantity > 0)
    .sort((a, b) => b.gmv - a.gmv);
}

export function buildAffiliateVideoRows(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters
): AffiliateVideoRow[] {
  const identityMap = buildCreatorIdentityMap(creators);
  const campaignMap = new Map(campaigns.map((campaign) => [campaign.campaignId, campaign]));
  const scopedVideos = filterVideos(videos, creators, snapshots, filters, filters.startDate, filters.endDate);
  const scopedFacts = filterFacts(facts, creators, snapshots, filters, filters.startDate, filters.endDate);
  return scopedVideos
    .flatMap((video) => {
      const creator = identityMap.get(normalizeUsername(video.creatorUsername));
      const campaign = campaignMap.get(video.campaignId);
      if (!creator || !campaign) return [];
      const videoFacts = scopedFacts.filter((fact) => fact.videoId === video.videoId);
      const validation = validateVideoHashtags(video.hashtags, campaign.requiredHashtags, campaign.minimumHashtagMatches);
      return [{ video, creator, campaign, gmv: videoFacts.reduce((sum, fact) => sum + fact.gmv, 0), nmv: videoFacts.reduce((sum, fact) => sum + netMerchandiseValue(fact), 0), matchedHashtags: validation.matchedHashtags, isValid: validation.isValid }];
    })
    .sort((a, b) => b.gmv - a.gmv);
}

export function buildCompetitionRows(
  competition: CompetitionPeriod,
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  snapshots: CreatorLevelSnapshot[] = [],
  filters?: AffiliateFilters
): CompetitionCreatorRow[] {
  const identityMap = buildCreatorIdentityMap(creators);
  const previous = previousPeriod(competition.startDate, competition.endDate);
  const competitionFilters = filters ? { ...filters, endDate: competition.endDate } : null;
  const eligibleIds = new Set(
    creators
      .filter((creator) => competition.participantCreatorIds.includes(creator.creatorId))
      .filter((creator) => !competitionFilters || creatorMatches(creator, competitionFilters, snapshots))
      .map((creator) => creator.creatorId)
  );
  const eventFacts = facts.filter((fact) => {
    const creator = identityMap.get(normalizeUsername(fact.creatorUsername));
    return creator && eligibleIds.has(creator.creatorId) && fact.campaignId === competition.campaignId && inRange(fact.date, competition.startDate, competition.endDate);
  });
  const previousFacts = facts.filter((fact) => {
    const creator = identityMap.get(normalizeUsername(fact.creatorUsername));
    return creator && eligibleIds.has(creator.creatorId) && fact.campaignId === competition.campaignId && inRange(fact.date, previous.startDate, previous.endDate);
  });
  const validVideoIdsForEvent = new Set(
    videos
      .filter((video) => video.campaignId === competition.campaignId && inRange(video.videoPostTime, competition.startDate, competition.endDate))
      .filter((video) => validateVideoHashtags(video.hashtags, competition.requiredHashtags, competition.minimumHashtagMatches).isValid)
      .map((video) => video.videoId)
  );
  return creators
    .filter((creator) => eligibleIds.has(creator.creatorId))
    .map((creator) => {
      const isCreator = (username: string) => identityMap.get(normalizeUsername(username))?.creatorId === creator.creatorId;
      const creatorFacts = eventFacts.filter((fact) => isCreator(fact.creatorUsername));
      const priorFacts = previousFacts.filter((fact) => isCreator(fact.creatorUsername));
      const gmv = creatorFacts.reduce((sum, fact) => sum + fact.gmv, 0);
      const priorGmv = priorFacts.reduce((sum, fact) => sum + fact.gmv, 0);
      const validVideoQuantity = new Set(
        videos.filter((video) => isCreator(video.creatorUsername) && validVideoIdsForEvent.has(video.videoId)).map((video) => video.videoId)
      ).size;
      return { rank: 0, creator, gmv, nmv: creatorFacts.reduce((sum, fact) => sum + netMerchandiseValue(fact), 0), validVideoQuantity, growthPct: growthPct(gmv, priorGmv) };
    })
    .sort((a, b) => b.gmv - a.gmv)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function findUnmatchedUsernames(facts: AffiliateDailyFact[], creators: AffiliateCreatorProfile[]): string[] {
  const identityMap = buildCreatorIdentityMap(creators);
  return Array.from(
    new Set(facts.map((fact) => normalizeUsername(fact.creatorUsername)).filter((username) => !identityMap.has(username)))
  );
}

interface ChannelSums {
  gmvVideo: number;
  gmvLive: number;
  gmvCard: number;
  nmvVideo: number;
  nmvLive: number;
  nmvCard: number;
  commissionVideo: number;
  commissionLive: number;
  commissionCard: number;
  liveSessions: number; // one per LIVE fact row (a creator-day of live)
}

function emptyChannelSums(): ChannelSums {
  return { gmvVideo: 0, gmvLive: 0, gmvCard: 0, nmvVideo: 0, nmvLive: 0, nmvCard: 0, commissionVideo: 0, commissionLive: 0, commissionCard: 0, liveSessions: 0 };
}

function addChannelSums(a: ChannelSums, b: ChannelSums): ChannelSums {
  return {
    gmvVideo: a.gmvVideo + b.gmvVideo,
    gmvLive: a.gmvLive + b.gmvLive,
    gmvCard: a.gmvCard + b.gmvCard,
    nmvVideo: a.nmvVideo + b.nmvVideo,
    nmvLive: a.nmvLive + b.nmvLive,
    nmvCard: a.nmvCard + b.nmvCard,
    commissionVideo: a.commissionVideo + b.commissionVideo,
    commissionLive: a.commissionLive + b.commissionLive,
    commissionCard: a.commissionCard + b.commissionCard,
    liveSessions: a.liveSessions + b.liveSessions,
  };
}

const totalGmv = (s: ChannelSums) => s.gmvVideo + s.gmvLive + s.gmvCard;
const totalNmv = (s: ChannelSums) => s.nmvVideo + s.nmvLive + s.nmvCard;

function sumByCreatorChannel(
  facts: AffiliateDailyFact[],
  identityMap: Map<string, AffiliateCreatorProfile>
): Map<string, ChannelSums> {
  const result = new Map<string, ChannelSums>();
  for (const fact of facts) {
    const creator = identityMap.get(normalizeUsername(fact.creatorUsername));
    if (!creator) continue;
    const entry = result.get(creator.creatorId) ?? emptyChannelSums();
    const nmv = netMerchandiseValue(fact);
    if (fact.channel === "LIVE") {
      entry.gmvLive += fact.gmv;
      entry.nmvLive += nmv;
      entry.commissionLive += fact.commission;
      entry.liveSessions += 1;
    } else if (fact.channel === "PRODUCT_CARD") {
      entry.gmvCard += fact.gmv;
      entry.nmvCard += nmv;
      entry.commissionCard += fact.commission;
    } else {
      entry.gmvVideo += fact.gmv;
      entry.nmvVideo += nmv;
      entry.commissionVideo += fact.commission;
    }
    result.set(creator.creatorId, entry);
  }
  return result;
}

function videoCountByCreator(
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  snapshots: CreatorLevelSnapshot[],
  filters: AffiliateFilters,
  startDate: string,
  endDate: string
): Map<string, number> {
  const identityMap = buildCreatorIdentityMap(creators);
  const seen = new Map<string, Set<string>>();
  for (const video of filterVideos(videos, creators, snapshots, filters, startDate, endDate)) {
    const creator = identityMap.get(normalizeUsername(video.creatorUsername));
    if (!creator) continue;
    const set = seen.get(creator.creatorId) ?? new Set<string>();
    set.add(video.videoId);
    seen.set(creator.creatorId, set);
  }
  return new Map([...seen.entries()].map(([id, set]) => [id, set.size]));
}

function sumByPic<T>(byCreator: Map<string, T>, creatorById: Map<string, AffiliateCreatorProfile>, add: (a: T, b: T) => T, zero: () => T): Map<string, T> {
  const byPic = new Map<string, T>();
  for (const [creatorId, value] of byCreator.entries()) {
    const creator = creatorById.get(creatorId);
    if (!creator) continue;
    byPic.set(creator.pic, add(byPic.get(creator.pic) ?? zero(), value));
  }
  return byPic;
}

export interface AffiliatePicGroup {
  pic: AffiliatePic;
  totals: AffiliatePicRow;
  creators: AffiliatePicCreatorRow[];
}

export function buildAffiliatePicBreakdown(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  pics: AffiliatePic[],
  filters: AffiliateFilters
): AffiliatePicGroup[] {
  const previous = previousPeriod(filters.startDate, filters.endDate);
  const identityMap = buildCreatorIdentityMap(creators);
  const creatorById = new Map(creators.map((creator) => [creator.creatorId, creator]));

  // Reused for video-centric counts + level so hashtag validation stays DRY.
  const videoRows = buildAffiliateCreatorRows(facts, videos, creators, campaigns, snapshots, filters);
  const videoRowByCreator = new Map(videoRows.map((row) => [row.creator.creatorId, row]));

  const currentSums = sumByCreatorChannel(
    filterFacts(facts, creators, snapshots, filters, filters.startDate, filters.endDate),
    identityMap
  );
  const previousSums = sumByCreatorChannel(
    filterFacts(facts, creators, snapshots, filters, previous.startDate, previous.endDate),
    identityMap
  );

  // Per-PIC channel sums, current vs previous, plus the count of creators that
  // had any GMV last period (for the "creators vs previous" figure).
  const curByPic = new Map<string, ChannelSums>();
  const prevByPic = new Map<string, ChannelSums>();
  const prevCreatorsByPic = new Map<string, Set<string>>();
  const roll = (sums: Map<string, ChannelSums>, byPic: Map<string, ChannelSums>, creatorsByPic?: Map<string, Set<string>>) => {
    for (const [creatorId, s] of sums.entries()) {
      const creator = creatorById.get(creatorId);
      if (!creator) continue;
      byPic.set(creator.pic, addChannelSums(byPic.get(creator.pic) ?? emptyChannelSums(), s));
      if (creatorsByPic && totalGmv(s) > 0) {
        const set = creatorsByPic.get(creator.pic) ?? new Set<string>();
        set.add(creatorId);
        creatorsByPic.set(creator.pic, set);
      }
    }
  };
  roll(currentSums, curByPic);
  roll(previousSums, prevByPic, prevCreatorsByPic);

  const curVideoByCreator = videoCountByCreator(videos, creators, snapshots, filters, filters.startDate, filters.endDate);
  const prevVideoByCreator = videoCountByCreator(videos, creators, snapshots, filters, previous.startDate, previous.endDate);
  const addNum = (a: number, b: number) => a + b;
  const curVideos = sumByPic(curVideoByCreator, creatorById, addNum, () => 0);
  const prevVideos = sumByPic(prevVideoByCreator, creatorById, addNum, () => 0);

  const candidateIds = new Set<string>([...currentSums.keys(), ...videoRowByCreator.keys()]);
  const rowByCreator = new Map<string, AffiliatePicCreatorRow>();
  for (const creatorId of candidateIds) {
    const creator = creatorById.get(creatorId);
    if (!creator) continue;
    const cur = currentSums.get(creatorId) ?? emptyChannelSums();
    const prev = previousSums.get(creatorId) ?? emptyChannelSums();
    const videoRow = videoRowByCreator.get(creatorId);
    const row: AffiliatePicCreatorRow = {
      creator,
      level: videoRow?.level ?? getCreatorLevel(creatorId, filters.endDate, snapshots),
      gmv: metric(totalGmv(cur), totalGmv(prev)),
      nmv: metric(totalNmv(cur), totalNmv(prev)),
      gmvVideo: metric(cur.gmvVideo, prev.gmvVideo),
      videoQuantity: metric(curVideoByCreator.get(creatorId) ?? 0, prevVideoByCreator.get(creatorId) ?? 0),
      gmvLive: metric(cur.gmvLive, prev.gmvLive),
      liveSessions: metric(cur.liveSessions, prev.liveSessions),
      gmvProductCard: metric(cur.gmvCard, prev.gmvCard),
    };
    if (row.gmv.current > 0 || row.videoQuantity.current > 0) rowByCreator.set(creatorId, row);
  }

  return pics
    .map((pic) => {
      const groupCreators = [...rowByCreator.values()]
        .filter((row) => row.creator.pic === pic.picId)
        .sort((a, b) => b.gmv.current - a.gmv.current);
      const cur = curByPic.get(pic.picId) ?? emptyChannelSums();
      const prev = prevByPic.get(pic.picId) ?? emptyChannelSums();
      const totals: AffiliatePicRow = {
        pic,
        creatorCount: metric(groupCreators.length, prevCreatorsByPic.get(pic.picId)?.size ?? 0),
        videoQuantity: metric(curVideos.get(pic.picId) ?? 0, prevVideos.get(pic.picId) ?? 0),
        gmv: metric(totalGmv(cur), totalGmv(prev)),
        nmv: metric(totalNmv(cur), totalNmv(prev)),
        gmvVideo: metric(cur.gmvVideo, prev.gmvVideo),
        gmvLive: metric(cur.gmvLive, prev.gmvLive),
        gmvProductCard: metric(cur.gmvCard, prev.gmvCard),
      };
      return { pic, totals, creators: groupCreators };
    })
    .filter((group) => group.totals.creatorCount.current > 0);
}

export function buildAffiliatePicRows(
  facts: AffiliateDailyFact[],
  videos: AffiliateVideo[],
  creators: AffiliateCreatorProfile[],
  campaigns: AffiliateCampaign[],
  snapshots: CreatorLevelSnapshot[],
  pics: AffiliatePic[],
  filters: AffiliateFilters
): AffiliatePicRow[] {
  return buildAffiliatePicBreakdown(facts, videos, creators, campaigns, snapshots, pics, filters).map(
    (group) => group.totals
  );
}
