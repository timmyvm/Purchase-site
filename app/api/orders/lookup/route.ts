import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";
import { findOrderForCustomer } from "@/app/lib/orders";
import { getOrderStatusPath, getOrderStatusToken } from "@/app/lib/order-status-token";

export const dynamic = "force-dynamic";

// Track Order form: order number + email. The same answer for "no such
// order" and "wrong email", so the form can't be used to probe order numbers.
export async function POST(request: Request) {
  const limited = rateLimit(`order-lookup:${getClientIp(request)}`, 10, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many lookups. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  let body: { orderNumber?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber : "";
  const email = typeof body.email === "string" ? body.email : "";
  if (!orderNumber || !email) {
    return NextResponse.json({ error: "Enter your order number and email." }, { status: 400 });
  }

  try {
    const order = await findOrderForCustomer(orderNumber, email);
    if (!order) {
      return NextResponse.json(
        { error: "We couldn't find an order with that number and email." },
        { status: 404 }
      );
    }
    if (!getOrderStatusToken(order.orderNumber)) {
      console.error("[orders] ORDER_STATUS_LINK_SECRET is not set; order pages can't be opened.");
      return NextResponse.json({ error: "Order tracking is unavailable right now." }, { status: 503 });
    }
    return NextResponse.json({ redirectTo: getOrderStatusPath(order.orderNumber) });
  } catch (error) {
    console.error("[orders] lookup failed", error);
    return NextResponse.json({ error: "Order tracking is unavailable right now." }, { status: 500 });
  }
}
