import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/types";
import { Container } from "@/app/components/ui/Container";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { formatMoney, getRemaining, isProductSoldOut } from "@/app/lib/currency";
import { getCollection } from "@/app/lib/collections";
import { productPath } from "@/app/lib/product-slugs";
import { getEditionLine } from "@/app/components/products/product-facts";
import {
  getSetComparison,
  getSetContents,
  getSetSize,
} from "@/app/components/products/set-pricing";

type FullSetSectionProps = {
  set: Product;
  products: Product[];
};

/**
 * The full set, in APL's featured bundle-card treatment (orange ring + badge,
 * orange CTA). It states what's inside — every single of its drop — and the
 * "% below singles" line only when getSetComparison says the gap is real
 * (>= 5% against the same designs bought singly at the set's size).
 */
export const FullSetSection = ({ set, products }: FullSetSectionProps) => {
  const contents = getSetContents(set, products);
  const comparison = getSetComparison(set, products);
  const variant = set.variants[0];
  const soldOut = isProductSoldOut(set);
  const collection = getCollection("sets");
  if (!variant) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-8">
        <SectionHeading
          title="The Full Set"
          subtitle={collection?.description ?? set.shortDescription}
          align="left"
        />
        <Link
          href={productPath(set)}
          className="group relative grid overflow-hidden rounded-2xl border border-[color:var(--color-highlight)] bg-[color:var(--color-surface)] ring-1 ring-[color:var(--color-highlight)] transition hover:shadow-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        >
          <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-[color:var(--color-highlight)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm lg:left-4 lg:translate-x-0">
            {soldOut ? "Sold out" : "Full set"}
          </span>

          <div className="relative aspect-[4/3] overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] lg:aspect-auto lg:min-h-[380px] lg:border-b-0 lg:border-r">
            <Image
              src={set.image.src}
              alt={set.image.alt}
              fill
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-contain p-6 drop-shadow-[0_18px_32px_rgba(0,0,0,0.14)] sm:p-10"
            />
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-xl font-semibold text-[color:var(--color-ink)] transition group-hover:text-[color:var(--color-primary)] sm:text-2xl">
                {set.name}
              </h3>
              {comparison ? (
                <span className="shrink-0 rounded-full bg-[color:var(--color-success)]/15 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--color-success)]">
                  {comparison.percent}% below singles
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              {set.shortDescription}
            </p>

            {contents.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-subtle)]">
                  Inside: {contents.length} designs at {getSetSize(set)}
                </p>
                <ul className="flex flex-wrap gap-1">
                  {contents.map((design) => (
                    <li
                      key={design.id}
                      className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--color-ink-muted)]"
                    >
                      {design.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-2xl font-bold text-[color:var(--color-ink)]">
                {formatMoney(variant.price)}
              </span>
              <span className="text-xs text-[color:var(--color-ink-muted)]">AUD</span>
              {comparison ? (
                <span className="text-sm text-[color:var(--color-ink-muted)]">
                  <span className="line-through">{formatMoney(comparison.singlesPrice)}</span>{" "}
                  singly
                </span>
              ) : null}
            </div>
            <p className="text-[13px] text-[color:var(--color-ink-muted)]">
              {variant.sizeLabel} · {getEditionLine(set)} · {getRemaining(set)} left
            </p>

            {/* Button-styled (the whole card is the link). */}
            <span className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[color:var(--color-highlight)] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[color:var(--color-highlight-strong)] sm:w-auto sm:self-start sm:px-6">
              View the set
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </Container>
    </section>
  );
};
