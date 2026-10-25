import type { Metadata } from "next";
import { CheckoutPageClient } from "@/app/components/cart/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

// Cart (localStorage) and live stock (/api/products) are both client-side;
// the order is priced server-side by place_sticker_order() on submit.
export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
