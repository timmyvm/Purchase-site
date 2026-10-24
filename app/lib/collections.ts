import type { Product } from "@/app/lib/types";

export type CollectionIcon = "drop" | "holo" | "gloss" | "set";

export type Collection = {
  slug: string;
  label: string;
  blurb: string;
  description: string;
  icon: CollectionIcon;
  match: (product: Product) => boolean;
};

// The Shop dropdown, the mobile drawer and /collections/[slug] all read this
// list, so a new drop or finish is one entry here.
export const COLLECTIONS: Collection[] = [
  {
    slug: "drop-01",
    label: "Drop 01 · Down Under",
    blurb: "Ten Aussie designs, two sizes",
    description:
      "Our first drop: ten designs from the Australian everyday, from the bin chicken to the W-class tram. Each design is a single limited print run.",
    icon: "drop",
    match: (product) => product.dropName === "Drop 01",
  },
  {
    slug: "holographic",
    label: "Holographic",
    blurb: "Smaller runs on rainbow vinyl",
    description:
      "Designs printed on holographic vinyl that shifts colour in the light. Holographic designs are printed in smaller runs than gloss.",
    icon: "holo",
    match: (product) => product.kind === "single" && product.finish.includes("Holographic"),
  },
  {
    slug: "gloss",
    label: "Gloss",
    blurb: "Bold colour, gloss finish",
    description: "Designs printed on gloss-finish die-cut vinyl.",
    icon: "gloss",
    match: (product) => product.kind === "single" && product.finish === "Gloss",
  },
  {
    slug: "sets",
    label: "Full sets",
    blurb: "Every design in one pack",
    description: "Every design from a drop in one pack, packed from its own allocation.",
    icon: "set",
    match: (product) => product.kind === "set",
  },
];

export const getCollection = (slug: string) =>
  COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
