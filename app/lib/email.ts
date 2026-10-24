import "server-only";

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; skipped: true }
  | { ok: false; skipped?: false; status: number; error: string };

/**
 * Resend over plain fetch. Nothing is sent until RESEND_API_KEY and
 * EMAIL_FROM are both set, and EMAIL_FROM must be on a domain verified in
 * Resend for THIS store: never borrow another brand's sending domain.
 */
export const sendEmail = async (message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<SendEmailResult> => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { ok: false, skipped: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    console.error(`[email] Resend ${response.status}: ${error}`);
    return { ok: false, status: response.status, error };
  }
  const payload = (await response.json()) as { id?: string };
  return { ok: true, id: payload.id ?? "" };
};
