import { NextResponse } from "next/server";
import { getLiveProducts } from "@/app/lib/data";

export const dynamic = "force-dynamic";

// Live catalogue for the cart and checkout: uncached, so stock is current.
export async function GET() {
  try {
    const products = await getLiveProducts();
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load products." }, { status: 503 });
  }
}
