import type { Metadata } from "next";
import { CartPageClient } from "@/app/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

// The cart lives in localStorage and prices/stock come from /api/products, so
// the page itself is static: it ships a skeleton and fills in on the client.
export default function CartPage() {
  return <CartPageClient />;
}
