import { NextResponse } from "next/server";
import { CONTACT_LIMITS } from "@/app/components/sections/ContactLimits";
import { BUSINESS } from "@/app/lib/business-identity";
import { sendEmail } from "@/app/lib/email";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { isValidEmail } from "@/app/lib/validators";

export const dynamic = "force-dynamic";

const NOT_CONFIGURED = "The contact form isn't available right now.";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Trimmed string, or "" for anything that isn't one. */
const field = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Single-line fields go into the subject, so newlines and runs of space collapse. */
const singleLine = (value: string) => value.replace(/\s+/g, " ");

// { name, email, orderNumber?, message } → { ok: true }. Sends one email to
// ORDER_ALERT_EMAIL with Reply-To set to the sender, so answering is a reply.
// 503 while ORDER_ALERT_EMAIL or Resend isn't configured: the form then
// points people at the support inbox instead.
export async function POST(request: Request) {
  const limited = rateLimit(`contact:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const alertTo = process.env.ORDER_ALERT_EMAIL?.trim();
  if (!alertTo) {
    return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object") throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = singleLine(field(body.name));
  const email = field(body.email).toLowerCase();
  const orderNumber = singleLine(field(body.orderNumber)).toUpperCase();
  const message = field(body.message).replace(/\r\n?/g, "\n");

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }
  if (
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    orderNumber.length > CONTACT_LIMITS.orderNumber ||
    message.length > CONTACT_LIMITS.message
  ) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const subject = `[${BUSINESS.tradingName}] Message from ${name}${orderNumber ? ` · order ${orderNumber}` : ""}`;
  const rows: Array<[string, string]> = [
    ["Name", name],
    ["Email", email],
    ...(orderNumber ? ([["Order number", orderNumber]] as Array<[string, string]>) : []),
  ];

  const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Manrope,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px">
<tr><td style="padding:24px 28px 8px">
<p style="margin:0;color:#3b82f6;font-weight:700;font-size:16px">Contact form · ${escapeHtml(BUSINESS.tradingName)}</p>
<table role="presentation" width="100%" style="margin-top:12px">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#475569;font-size:14px;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;color:#0f172a;font-size:14px;font-family:monospace">${escapeHtml(value)}</td></tr>`
    )
    .join("")}</table>
</td></tr>
<tr><td style="padding:8px 28px 28px"><div style="border-top:1px solid #e2e8f0;padding-top:16px;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</div></td></tr>
</table></td></tr></table></body></html>`;

  const text = [...rows.map(([label, value]) => `${label}: ${value}`), "", message].join("\n");

  try {
    const result = await sendEmail({ to: alertTo, subject, html, text, replyTo: email });
    if (result.ok) return NextResponse.json({ ok: true });
    if (result.skipped) return NextResponse.json({ error: NOT_CONFIGURED }, { status: 503 });
    return NextResponse.json(
      { error: "We couldn't send your message just now. Please try again." },
      { status: 502 }
    );
  } catch (error) {
    console.error("[contact] send failed", error);
    return NextResponse.json(
      { error: "We couldn't send your message just now. Please try again." },
      { status: 502 }
    );
  }
}
