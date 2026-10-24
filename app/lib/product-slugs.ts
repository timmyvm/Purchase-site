import type { Product } from "@/app/lib/types";

export const productPath = (product: Pick<Product, "slug">) => `/product/${product.slug}`;
