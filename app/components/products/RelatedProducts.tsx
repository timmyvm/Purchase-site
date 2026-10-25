import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/types";
import {
  formatMoney,
  getCheapestVariant,
  isProductSoldOut,
} from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";

const MAX_RELATED = 4;

/**
 * Other designs from the same drop, in-stock first then catalogue order,
 * excluding the current one. Data only: no "bought together" claims.
 */
export const getRelatedProducts = (products: Product[], current: Product) =>
  products
    .filter((product) => product.id !== current.id && product.dropName === current.dropName)
    .sort((a, b) => {
      const stock = Number(isProductSoldOut(a)) - Number(isProductSoldOut(b));
      return stock !== 0 ? stock : a.sortOrder - b.sortOrder;
    })
    .slice(0, MAX_RELATED);

type RelatedProductsProps = {
  dropName: string;
  products: Product[];
};

/** Port of APL's "Frequently Paired With" strip, as "More from <drop>". */
export const RelatedProducts = ({ dropName, products }: RelatedProductsProps) => {
  if (products.length === 0) return null;
  return (
    <section className="space-y-6" aria-labelledby="related-heading">
      <div className="space-y-1.5">
        <h2
          id="related-heading"
          className="font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
        >
          More from {dropName}
        </h2>
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Other designs from the same drop.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((related) => {
          const soldOut = isProductSoldOut(related);
          const cheapest = getCheapestVariant(related.variants);
          return (
            <Link
              key={related.id}
              href={productPath(related)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] transition hover:-translate-y-0.5 hover:border-[color:var(--color-primary-soft)] hover:shadow-card"
            >
              <div className="relative aspect-[4/3] bg-[color:var(--color-surface-muted)]">
                <Image
                  src={related.image.src}
                  alt={related.image.alt}
                  fill
                  sizes="(min-width: 1024px) 260px, 45vw"
                  className="object-contain p-4"
                />
                {soldOut ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[color:var(--color-surface-elevated)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink)]">
                    SOLD OUT
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-display text-sm font-bold text-[color:var(--color-ink)]">
                  {related.name}
                </h3>
                <p className="line-clamp-2 text-[11.5px] leading-snug text-[color:var(--color-ink-muted)]">
                  {related.shortDescription}
                </p>
                <p className="text-[13px] font-semibold text-[color:var(--color-ink)]">
                  {related.variants.length > 1 ? "From " : ""}
                  {formatMoney(cheapest.price)}
                </p>
                <span className="mt-auto inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[color:var(--color-ink)] px-3 py-2 text-xs font-semibold text-white transition group-hover:opacity-90">
                  View
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
