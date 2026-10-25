import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/types";
import { productPath } from "@/app/lib/product-slugs";
import { getProductSpecRows } from "@/app/components/products/product-facts";

type ProductDetailsProps = {
  product: Product;
  /** Full sets only: the single designs in the pack. */
  setContents?: Product[];
  setSize?: string;
};

/**
 * Below-the-hero details: the long description and the spec table (Finish,
 * Material, Sizes, Edition size, Drop), and for a full set the designs in
 * the pack, each linked. Server-rendered static content.
 */
export const ProductDetails = ({ product, setContents = [], setSize }: ProductDetailsProps) => {
  const paragraphs = product.longDescription
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const specRows = getProductSpecRows(product);

  return (
    <section className="space-y-6" aria-labelledby="product-details-heading">
      <h2
        id="product-details-heading"
        className="font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
      >
        About {product.name}
      </h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
        <div className="space-y-4 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          ) : (
            <p>{product.shortDescription}</p>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <caption className="sr-only">{product.name} specifications</caption>
            <tbody>
              {specRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={
                    i % 2 === 0
                      ? "bg-[color:var(--color-surface)]"
                      : "bg-[color:var(--color-surface-elevated)]"
                  }
                >
                  <th
                    scope="row"
                    className="w-2/5 px-4 py-3 text-left font-semibold text-[color:var(--color-ink-muted)]"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-[color:var(--color-ink)]">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {setContents.length > 0 ? (
        <div className="space-y-4 pt-2">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-xl">
            In this set: {setContents.length} designs{setSize ? ` at ${setSize}` : ""}
          </h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {setContents.map((design) => (
              <li key={design.id}>
                <Link
                  href={productPath(design)}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-2.5 transition hover:border-[color:var(--color-primary-soft)]"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[color:var(--color-surface-muted)]">
                    <Image
                      src={design.image.src}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-[color:var(--color-ink)] transition group-hover:text-[color:var(--color-primary)]">
                      {design.name}
                    </span>
                    <span className="block text-[11px] text-[color:var(--color-ink-subtle)]">
                      {design.finish}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
