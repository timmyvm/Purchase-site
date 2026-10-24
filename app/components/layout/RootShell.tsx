"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/app/components/layout/Header";
import { CheckoutHeader } from "@/app/components/layout/CheckoutHeader";
import { BottomNav } from "@/app/components/layout/BottomNav";
import type { NavProduct } from "@/app/lib/nav-products";

type RootShellProps = {
  children: ReactNode;
  products: NavProduct[];
  promoMessages: readonly string[];
  /** Server-rendered footer (kept as RSC so it stays out of the client bundle). */
  footer: ReactNode;
};

export const RootShell = ({ children, products, promoMessages, footer }: RootShellProps) => {
  const pathname = usePathname();
  const isCheckoutRoute = pathname === "/checkout" || pathname?.startsWith("/checkout/");

  return (
    <>
      {/* Distraction-free checkout: logo + secure badge only, no nav, footer
          or bottom-tab exit links. */}
      {isCheckoutRoute ? (
        <CheckoutHeader />
      ) : (
        <Header products={products} promoMessages={promoMessages} />
      )}
      <main className={isCheckoutRoute ? "" : "pb-16 md:pb-0"}>{children}</main>
      {isCheckoutRoute ? null : footer}
      {isCheckoutRoute ? null : <BottomNav />}
    </>
  );
};
