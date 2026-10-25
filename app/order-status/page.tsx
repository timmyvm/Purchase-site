import type { Metadata } from "next";
import { Container } from "@/app/components/ui/Container";
import { OrderLookupForm } from "@/app/components/cart/OrderLookupForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Look up a Peel Supply order with your order number and the email you ordered with.",
  robots: { index: false, follow: true },
};

export default function OrderStatusPage() {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto w-full max-w-2xl">
          <OrderLookupForm />
        </div>
      </Container>
    </section>
  );
}
