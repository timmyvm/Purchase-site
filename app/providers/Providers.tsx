"use client";

import { CartProvider } from "@/app/providers/CartProvider";
import { SITE } from "@/app/lib/site";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => (
  <CartProvider storageKey={SITE.storage.cartKey}>{children}</CartProvider>
);
