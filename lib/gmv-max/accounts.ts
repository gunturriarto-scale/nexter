export interface GmvMaxAccount {
  brand: string;
  advertiserId: string;
  accessToken: string;
  storeIds: string[];
}

/**
 * TIKTOK_GMV_MAX_ACCOUNTS is a JSON array, one entry per brand's ad account:
 * [{"brand":"Glow FX","advertiser_id":"...","access_token":"...","store_ids":["..."]}]
 * Kept as a single env var (rather than per-brand vars) so more brands can be
 * added later without a code change.
 */
export function getGmvMaxAccounts(): GmvMaxAccount[] {
  const raw = process.env.TIKTOK_GMV_MAX_ACCOUNTS;
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `TIKTOK_GMV_MAX_ACCOUNTS is not valid JSON: ${(err as Error).message}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("TIKTOK_GMV_MAX_ACCOUNTS must be a JSON array");
  }

  return parsed.map((entry, i) => {
    const e = entry as Record<string, unknown>;
    if (!e.brand || !e.advertiser_id || !e.access_token) {
      throw new Error(
        `TIKTOK_GMV_MAX_ACCOUNTS[${i}] is missing brand/advertiser_id/access_token`
      );
    }
    const storeIds = Array.isArray(e.store_ids)
      ? (e.store_ids as string[])
      : e.store_id
        ? [e.store_id as string]
        : [];
    return {
      brand: e.brand as string,
      advertiserId: e.advertiser_id as string,
      accessToken: e.access_token as string,
      storeIds,
    };
  });
}
