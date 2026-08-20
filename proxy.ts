import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hermes_session";

/**
 * Simple staging gate — no database, no user records. A visitor is "logged
 * in" when their session cookie matches STAGING_SESSION_SECRET, set by
 * app/api/login/route.ts after checking STAGING_LOGIN_EMAIL/PASSWORD.
 * Only gates page routes; /api/* is excluded so the Shopee OAuth callback
 * and the bearer-secret-protected sync routes keep working unauthenticated.
 */
export function proxy(req: NextRequest) {
  const expected = process.env.STAGING_SESSION_SECRET;
  if (!expected) return NextResponse.next();

  const session = req.cookies.get(COOKIE_NAME)?.value;
  if (session === expected) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  const next = req.nextUrl.pathname + req.nextUrl.search;
  if (next !== "/") loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};
