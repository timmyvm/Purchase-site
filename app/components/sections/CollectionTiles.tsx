import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { CollectionIcon } from "@/app/components/products/CollectionIcon";
import { COLLECTIONS } from "@/app/lib/collections";
import type { Product } from "@/app/lib/types";

type CollectionTilesProps = {
  products: Product[];
};

const PREVIEW_NAMES = 3;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** "10 designs · 1 set" — singles and sets counted apart, never summed. */
const getCountLine = (products: Product[]) => {
  const singles = products.filter((product) => product.kind === "single").length;
  const sets = products.length - singles;
  return [singles > 0 ? plural(singles, "design") : null, sets > 0 ? plural(sets, "set") : null]
    .filter(Boolean)
    .join(" · ");
};

/** "Bin Chicken, Swooping Season, Last Laugh + 7 more" from the live catalogue. */
const getPreview = (products: Product[]) => {
  const names = products.map((product) => product.name);
  const shown = names.slice(0, PREVIEW_NAMES).join(", ");
  const rest = names.length - PREVIEW_NAMES;
  return rest > 0 ? `${shown} + ${rest} more` : shown;
};

/**
 * "Shop by Collection" (port of APL's ResearchAreaTiles), driven by
 * COLLECTIONS. Each tile names the designs actually listed in it and states
 * the real count; a collection with nothing listed is left out.
 */
export const CollectionTiles = ({ products }: CollectionTilesProps) => {
  const tiles = COLLECTIONS.map((collection) => {
    // Designs before sets, so a drop's preview names its stickers first.
    const members = products
      .filter(collection.match)
      .sort((a, b) =>
        a.kind === b.kind ? a.sortOrder - b.sortOrder : a.kind === "single" ? -1 : 1
      );
    return { collection, members };
  }).filter((tile) => tile.members.length > 0);

  if (tiles.length === 0) return null;

  return (
    <section className="py-10 sm:py-12">
      <Container className="space-y-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl">
            Shop by Collection
          </h2>
          <p className="mt-1.5 text-sm text-[color:var(--color-ink-muted)]">
            {products.length} sticker{products.length === 1 ? "" : "s"} — by drop, finish or full set
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ collection, members }) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-primary-soft)] hover:shadow-card sm:p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(59,130,246,0.08)] text-[color:var(--color-primary)]">
                <CollectionIcon icon={collection.icon} className="h-[18px] w-[18px]" />
              </span>
              <h3 className="font-display text-base font-bold text-[color:var(--color-ink)]">
                {collection.label}
              </h3>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-subtle)]">
                {getCountLine(members)}
              </p>
              <p className="text-[13px] leading-snug text-[color:var(--color-ink-muted)]">
                {getPreview(members)}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-primary)] transition group-hover:gap-1.5">
                Browse {collection.label}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
