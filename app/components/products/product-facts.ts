import type { Product } from "@/app/lib/types";

/**
 * Plain-data lines every catalogue surface states about a design: its sizes,
 * its edition and its spec rows. Card, product hero, spec table, info modal
 * and metadata all read these, so they can never describe one design two
 * ways. Client-safe: no server-only imports.
 */

/** "7.5 cm or 10 cm"; "Set of 10 · 7.5 cm" for a single-variant set. */
export const formatSizeList = (product: Pick<Product, "variants">) => {
  const labels = product.variants.map((variant) => variant.sizeLabel);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
};

/** "Limited run of 200" — edition_size, the number that was printed. */
export const getEditionLine = (product: Pick<Product, "editionSize">) =>
  `Limited run of ${product.editionSize}`;

/**
 * Smaller second line inside the product <h1>: what the thing physically is,
 * from catalogue data only ("Gloss die-cut sticker, 7.5 cm or 10 cm").
 */
export const getProductHeadingQualifier = (product: Product) =>
  product.kind === "set"
    ? `${product.finish} sticker set, ${formatSizeList(product)}`
    : `${product.finish} die-cut sticker, ${formatSizeList(product)}`;

export type SpecRow = { label: string; value: string };

export const getProductSpecRows = (product: Product): SpecRow[] => [
  { label: "Finish", value: product.finish },
  { label: "Material", value: product.material },
  { label: product.kind === "set" ? "Pack" : "Sizes", value: formatSizeList(product) },
  { label: "Edition size", value: getEditionLine(product) },
  { label: "Drop", value: product.dropName },
];
