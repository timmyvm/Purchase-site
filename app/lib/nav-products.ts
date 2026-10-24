import type { Product } from "@/app/lib/types";
import { isProductSoldOut } from "@/app/lib/currency";

// Minimal product projection for the always-mounted client chrome (header
// search). Keep this to exactly what the chrome renders so the full catalogue
// isn't serialized into every page.
export type NavProduct = {
  id: string;
  slug: string;
  name: string;
  finish: string;
  inStock: boolean;
};

export const toNavProducts = (products: Product[]): NavProduct[] =>
  products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    finish: product.finish,
    inStock: !isProductSoldOut(product),
  }));
