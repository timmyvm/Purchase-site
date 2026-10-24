import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { getSupabaseAdmin } from "@/app/lib/supabase/server";
import { isValidEmail } from "@/app/lib/validators";

export const dynamic = "force-dynamic";

// Drop alerts: { email, source? } → { ok: true }. Signing up twice is not an
// error (and doesn't reveal whether the address was already on the list).
export async function POST(request: Request) {
  const limited = rateLimit(`subscribe:${getClientIp(request)}`, 5, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many signups from this connection. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "site";

  try {
    const { error } = await getSupabaseAdmin()
      .from("sticker_subscribers")
      .insert({ email, source });
    // 23505: already on the list (unique index on lower(email)).
    if (error && error.code !== "23505") throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[subscribe] failed", error);
    return NextResponse.json({ error: "Couldn't sign you up just now. Please try again." }, { status: 500 });
  }
}
