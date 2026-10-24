import "server-only";

import { sendEmail } from "@/app/lib/email";
import { formatAud } from "@/app/lib/currency";
import { getBankTransferDetails, hasBankTransferDetails } from "@/app/lib/bank-transfer";
import { BUSINESS } from "@/app/lib/business-identity";
import { getBaseUrl } from "@/app/lib/metadata";
import { getOrderStatusPath } from "@/app/lib/order-status-token";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";
import type { StoredOrder } from "@/app/lib/orders";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Mirrors the storefront palette (app/globals.css): white sheet, slate ink,
// #3b82f6 blue.
const INK = "#0f172a";
const MUTED = "#475569";
const BORDER = "#e2e8f0";
const BLUE = "#3b82f6";

const row = (label: string, value: string, strong = false) =>
  `<tr><td style="padding:6px 0;color:${MUTED};font-size:14px">${escapeHtml(label)}</td><td style="padding:6px 0;text-align:right;color:${INK};font-size:14px;${strong ? "font-weight:700" : ""}">${escapeHtml(value)}</td></tr>`;

const buildCustomerEmail = (order: StoredOrder) => {
  const bank = getBankTransferDetails();
  const orderUrl = `${getBaseUrl()}${getOrderStatusPath(order.orderNumber)}`;
  const lines = order.items
    .map((line) => row(`${line.quantity} × ${line.name} (${line.size})`, formatAud(line.lineTotal)))
    .join("");
  const bankRows = hasBankTransferDetails(bank)
    ? [
        row("Account name", bank.accountName),
        row("BSB", bank.bsb),
        row("Account number", bank.accountNumber),
        row("Reference", order.orderNumber, true),
        row("Amount", formatAud(order.total), true),
      ].join("")
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Manrope,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0;color:${BLUE};font-weight:700;font-size:20px;letter-spacing:0.02em">${escapeHtml(BUSINESS.tradingName)}</p>
<h1 style="margin:16px 0 4px;color:${INK};font-size:22px">Thanks, ${escapeHtml(order.customerName.split(" ")[0] ?? "")} — order ${escapeHtml(order.orderNumber)} is in</h1>
<p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6">Your stickers are set aside for you. Pay by bank transfer within ${UNPAID_ORDER_HOURS} hours using the details below, with <strong>${escapeHtml(order.orderNumber)}</strong> as the reference, and we'll post them once it lands.</p>
</td></tr>
${bankRows ? `<tr><td style="padding:16px 28px"><table role="presentation" width="100%" style="border:1px dashed ${BORDER};border-radius:12px;padding:8px 16px">${bankRows}</table></td></tr>` : ""}
<tr><td style="padding:8px 28px"><table role="presentation" width="100%">${lines}
<tr><td colspan="2" style="border-top:1px solid ${BORDER}"></td></tr>
${row("Subtotal", formatAud(order.subtotal))}
${row("Shipping", order.shipping === 0 ? "Free" : formatAud(order.shipping))}
${row("Total", formatAud(order.total), true)}</table></td></tr>
<tr><td style="padding:16px 28px 28px"><a href="${orderUrl}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:8px">View your order</a></td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `Thanks — order ${order.orderNumber} is in.`,
    ``,
    `Pay by bank transfer within ${UNPAID_ORDER_HOURS} hours with ${order.orderNumber} as the reference:`,
    hasBankTransferDetails(bank)
      ? `Account name: ${bank.accountName}\nBSB: ${bank.bsb}\nAccount number: ${bank.accountNumber}`
      : "",
    `Amount: ${formatAud(order.total)}`,
    ``,
    ...order.items.map((line) => `${line.quantity} x ${line.name} (${line.size}) — ${formatAud(line.lineTotal)}`),
    `Shipping: ${order.shipping === 0 ? "Free" : formatAud(order.shipping)}`,
    `Total: ${formatAud(order.total)}`,
    ``,
    `View your order: ${orderUrl}`,
  ].join("\n");

  return { html, text };
};

/** Customer confirmation + owner alert. A failure is logged, never thrown. */
export const sendOrderEmails = async (order: StoredOrder) => {
  const customer = buildCustomerEmail(order);
  const results = [
    await sendEmail({
      to: order.email,
      subject: `Order ${order.orderNumber} — payment details inside`,
      html: customer.html,
      text: customer.text,
      replyTo: BUSINESS.email,
    }),
  ];

  const alertTo = process.env.ORDER_ALERT_EMAIL?.trim();
  if (alertTo) {
    const summary = order.items.map((line) => `${line.quantity} × ${line.name} (${line.size})`).join("\n");
    results.push(
      await sendEmail({
        to: alertTo,
        subject: `New sticker order ${order.orderNumber} — ${formatAud(order.total)}`,
        html: `<pre style="font-family:monospace">${escapeHtml(`${order.customerName} <${order.email}>\n\n${summary}\n\nTotal ${formatAud(order.total)}`)}</pre>`,
        text: `${order.customerName} <${order.email}>\n\n${summary}\n\nTotal ${formatAud(order.total)}`,
      })
    );
  }
  return results;
};
