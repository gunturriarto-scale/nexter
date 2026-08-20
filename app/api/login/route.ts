import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hermes_session";

/**
 * Static credential check — no database, no user table. Matches the
 * fixed STAGING_LOGIN_EMAIL/PASSWORD env vars and, on success, sets a
 * cookie equal to STAGING_SESSION_SECRET (checked by proxy.ts).
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  const expectedEmail = process.env.STAGING_LOGIN_EMAIL;
  const expectedPassword = process.env.STAGING_LOGIN_PASSWORD;
  const sessionSecret = process.env.STAGING_SESSION_SECRET;

  if (!expectedEmail || !expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "Login belum dikonfigurasi — STAGING_LOGIN_EMAIL/PASSWORD/STAGING_SESSION_SECRET kosong." },
      { status: 500 }
    );
  }

  if (email !== expectedEmail || password !== expectedPassword) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    if (next && next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next || "/", req.url), { status: 303 });
  res.cookies.set(COOKIE_NAME, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
