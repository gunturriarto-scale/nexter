// Standard influencer-marketing tier classification by follower count.
// Not a TikTok API field — this is an industry convention, thresholds vary
// slightly by source; adjust here if the team uses different cutoffs.

export type KolTier = "Nano" | "Micro" | "Mid" | "Macro" | "Mega";

export const TIER_ORDER: KolTier[] = ["Nano", "Micro", "Mid", "Macro", "Mega"];

export const TIER_LABEL: Record<KolTier, string> = {
  Nano: "Nano-KOL",
  Micro: "Micro-KOL",
  Mid: "Mid-tier KOL",
  Macro: "Macro-KOL",
  Mega: "Mega-KOL",
};

export const TIER_RANGE_LABEL: Record<KolTier, string> = {
  Nano: "< 10K follower",
  Micro: "10K – 50K",
  Mid: "50K – 500K",
  Macro: "500K – 1M",
  Mega: "1M+",
};

export function classifyTier(followerCount: number): KolTier {
  if (followerCount >= 1_000_000) return "Mega";
  if (followerCount >= 500_000) return "Macro";
  if (followerCount >= 50_000) return "Mid";
  if (followerCount >= 10_000) return "Micro";
  return "Nano";
}
