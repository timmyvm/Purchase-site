import Link from "next/link";
import type { Product } from "@/app/lib/types";
import { Container } from "@/app/components/ui/Container";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { ProductGrid } from "@/app/components/products/ProductGrid";

type ProductShowcaseSectionProps = {
  title: string;
  subtitle: string;
  products: Product[];
  /** e.g. "Shop all 11 stickers", counted from the live catalogue. */
  viewAllLabel?: string;
  viewAllHref?: string;
};

/**
 * Homepage product row (port of APL's ProductShowcaseSection): a scroll row
 * on phones, a 2/4-column grid from sm. "Shop all" is a blue text link, not a
 * button — orange stays on buy CTAs.
 */
export const ProductShowcaseSection = ({
  title,
  subtitle,
  products,
  viewAllLabel = "View all",
  viewAllHref = "/shop",
}: ProductShowcaseSectionProps) => (
  <section className="bg-transparent py-12 sm:py-14">
    <Container className="space-y-10 overflow-x-clip">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title={title} subtitle={subtitle} align="left" className="min-w-0" />
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[color:var(--color-primary)] transition hover:gap-1.5 hover:text-[color:var(--color-primary-soft)]"
        >
          {viewAllLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ProductGrid
        products={products}
        className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0"
        gridClassName="flex flex-nowrap gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4"
        itemClassName="min-w-[250px] shrink-0 sm:min-w-0 sm:shrink"
      />
    </Container>
  </section>
);
