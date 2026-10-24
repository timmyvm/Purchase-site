import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { placeOrder, type PlaceOrderInput } from "@/app/lib/orders";
import { getOrderStatusPath } from "@/app/lib/order-status-token";
import { sendOrderEmails } from "@/app/lib/order-emails";

export const dynamic = "force-dynamic";

// Unpaid orders hold limited-run stock for 48 hours, so placing orders gets
// the tightest limit: it is the cheapest way to tie up a whole run.
export async function POST(request: Request) {
  const limited = rateLimit(`orders:${getClientIp(request)}`, 5, 10 * 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  let body: PlaceOrderInput;
  try {
    body = (await request.json()) as PlaceOrderInput;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await placeOrder(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, field: result.field, variantId: result.variantId },
        { status: result.status }
      );
    }

    // Awaited on purpose: an un-awaited send can be frozen with the function
    // once the response is returned. A failed email never fails the order.
    await sendOrderEmails(result.order).catch((error) => {
      console.error("[orders] order emails failed", error);
    });

    return NextResponse.json({
      orderNumber: result.order.orderNumber,
      total: result.order.total,
      redirectTo: getOrderStatusPath(result.order.orderNumber),
    });
  } catch (error) {
    console.error("[orders] POST failed", error);
    return NextResponse.json(
      { error: "We couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}
