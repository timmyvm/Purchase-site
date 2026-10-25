import type { Product } from "@/app/lib/types";

const unique = <T,>(values: T[]) => [...new Set(values)];

/** "a", "a and b", "a, b and c" */
export const joinWithAnd = (parts: string[]) =>
  parts.length <= 1
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

const runLabel = (sizes: number[]) => {
  const sorted = [...sizes].sort((a, b) => a - b);
  return sorted.length === 1
    ? `${sorted[0]}`
    : `${sorted[0]} to ${sorted[sorted.length - 1]}`;
};

export type DropFacts = {
  designCount: number;
  /** ["Gloss", "Holographic"], in catalogue order. */
  finishes: string[];
  /** ["7.5 cm", "10 cm"], in catalogue order. */
  sizes: string[];
  /** One entry per finish: { finish: "Gloss", runs: "200" }. */
  runsByFinish: Array<{ finish: string; runs: string }>;
  /** Copies across every full set in the drop (0 when there is none). */
  setEditions: number;
};

/**
 * What /about says about a drop, read from the catalogue rather than typed:
 * the design count, finishes, sizes and edition sizes all come from
 * sticker_products / sticker_variants, so the page can't drift from what was
 * printed. Returns null when the catalogue is empty (e.g. no Supabase env),
 * and the page then leaves the numbers out.
 */
export const getDropFacts = (products: Product[]): DropFacts | null => {
  const singles = products.filter((product) => product.kind === "single");
  if (singles.length === 0) return null;
  const finishes = unique(singles.map((product) => product.finish));
  return {
    designCount: singles.length,
    finishes,
    sizes: unique(singles.flatMap((product) => product.variants.map((variant) => variant.sizeLabel))),
    runsByFinish: finishes.map((finish) => ({
      finish,
      runs: runLabel(
        unique(singles.filter((product) => product.finish === finish).map((p) => p.editionSize))
      ),
    })),
    setEditions: products
      .filter((product) => product.kind === "set")
      .reduce((sum, product) => sum + product.editionSize, 0),
  };
};

/** "gloss designs are printed in runs of 200 and holographic designs in runs of 100" */
export const describeRuns = (facts: DropFacts) =>
  joinWithAnd(
    facts.runsByFinish.map(({ finish, runs }, index) =>
      index === 0
        ? `${finish.toLowerCase()} designs are printed in runs of ${runs}`
        : `${finish.toLowerCase()} designs in runs of ${runs}`
    )
  );
