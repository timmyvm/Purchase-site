export type ProductVariant = {
  id: string;
  name: string;
  /** "7.5 cm", "Set of 10 · 7.5 cm" — what the size picker and cart show. */
  sizeLabel: string;
  /** AUD, from sticker_variants.price_aud. */
  price: number;
  inventory: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  image: {
    src: string;
    alt: string;
  };
  /** "Gloss", "Holographic", "Gloss + Holographic". */
  finish: string;
  material: string;
  dropName: string;
  kind: "single" | "set";
  /** Total printed across every size — the "limited run of N" figure. */
  editionSize: number;
  sortOrder: number;
  variants: ProductVariant[];
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

/** One line of sticker_orders.items, as place_sticker_order() writes it. */
export type OrderLine = {
  productId: string;
  productSlug: string;
  variantId: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";

export type ShippingAddress = {
  line1: string;
  line2?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: "AU";
};
