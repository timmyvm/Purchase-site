import Link from "next/link";
import type { Faq } from "@/app/lib/faqs";

/**
 * Product-page FAQ block (APL's "Frequently Asked Questions" list). Entries
 * are passed in verbatim from app/lib/faqs.ts, and the page builds its
 * FAQPage JSON-LD from the same array, so markup only describes what shows.
 */
export const ProductFaqSection = ({ faqs }: { faqs: Faq[] }) => {
  if (faqs.length === 0) return null;
  return (
    <section className="max-w-4xl space-y-6" aria-labelledby="product-faq-heading">
      <h2
        id="product-faq-heading"
        className="font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
      >
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((item) => (
          <article
            key={item.question}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
          >
            <h3 className="text-base font-semibold text-[color:var(--color-ink)]">{item.question}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--color-ink-muted)]">
              {item.answer}
            </p>
          </article>
        ))}
      </div>
      <p className="text-sm text-[color:var(--color-ink-muted)]">
        Payment, order limits and returns are covered in the{" "}
        <Link
          href="/faq"
          className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
        >
          full FAQ
        </Link>
        .
      </p>
    </section>
  );
};
