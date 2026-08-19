import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Server-only client using the service role key. gmv_max_* tables have RLS
 * enabled with no public policies (same pattern as tiktok_ads_performance),
 * so all reads/writes for this data go through this client from server
 * components / route handlers only — never import this in client components.
 */
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
