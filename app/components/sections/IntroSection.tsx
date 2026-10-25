import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { BUSINESS } from "@/app/lib/business-identity";
import { getCollection } from "@/app/lib/collections";
import { productPath } from "@/app/lib/product-slugs";
import { DISPATCH_CLAIM_SHORT, SHIPPING_FACTS } from "@/app/lib/shipping";
import type { Product } from "@/app/lib/types";

type IntroSectionProps = {
  products: Product[];
  /** Designs named as examples, in this order, while they are listed. */
  exampleSlugs: string[];
};

const linkClass =
  "font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline";

const joinWithAnd = (items: ReactNode[]) =>
  items.flatMap((item, index) => {
    if (index === 0) return [item];
    const separator = index === items.length - 1 ? " and " : ", ";
    return [separator, item];
  });

/**
 * The brand heading plus the homepage's first body links (/shop and the
 * Drop 01 collection), directly above the showcase grid (port of APL's
 * AplIntroSection). One short paragraph so the grid still starts high;
 * server-rendered static text with nothing to shift on hydration.
 */
export const IntroSection = ({ products, exampleSlugs }: IntroSectionProps) => {
  const drop = getCollection("drop-01");
  const listed = new Map(products.map((product) => [product.slug, product]));
  const dropDesigns = drop
    ? products.filter((product) => product.kind === "single" && drop.match(product))
    : [];
  const examples = exampleSlugs.flatMap((slug) => {
    const product = listed.get(slug);
    if (!product) return [];
    return [
      <Link key={slug} href={productPath(product)} className={linkClass}>
        {product.name}
      </Link>,
    ];
  });

  return (
    // Top padding only: the facts strip above already draws a border, and the
    // next section's own top padding separates it from the grid.
    <section className="pt-8 sm:pt-10">
      <Container>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-2xl">
            {BUSINESS.tradingName}: limited-run stickers, posted from{" "}
            {BUSINESS.dispatchFrom.city}
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-[15px]">
            <p>
              {BUSINESS.tradingName} prints{" "}
              <Link href="/shop" className={linkClass}>
                die-cut vinyl stickers
              </Link>{" "}
              in single limited runs
              {drop ? (
                <>
                  , starting with{" "}
                  <Link href={`/collections/${drop.slug}`} className={linkClass}>
                    {drop.label}
                  </Link>
                  {dropDesigns.length > 0 ? `: ${dropDesigns.length} designs` : ""}
                  {examples.length > 0 ? <> (including {joinWithAnd(examples)})</> : null}
                </>
              ) : null}
              . Each design is printed once, in the quantity shown on its page,
              and isn&apos;t reprinted when it sells out.
            </p>
            <p className="text-[13px] text-[color:var(--color-ink-subtle)] sm:text-sm">
              Packed in {BUSINESS.dispatchFrom.city} and sent by {SHIPPING_FACTS.carrier}{" "}
              {SHIPPING_FACTS.service.toLowerCase()}:{" "}
              {DISPATCH_CLAIM_SHORT.charAt(0).toLowerCase()}
              {DISPATCH_CLAIM_SHORT.slice(1)}.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
