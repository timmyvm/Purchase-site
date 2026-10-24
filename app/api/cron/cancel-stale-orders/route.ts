import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/app/lib/supabase/server";
import { PRODUCTS_CACHE_TAG } from "@/app/lib/data";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin().rpc("cancel_stale_sticker_orders", {
    p_hours: UNPAID_ORDER_HOURS,
  });
  if (error) {
    console.error("[cron] cancel_stale_sticker_orders failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const cancelled = Number(data ?? 0);
  if (cancelled > 0) revalidateTag(PRODUCTS_CACHE_TAG, "max");
  return NextResponse.json({ cancelled });
}
