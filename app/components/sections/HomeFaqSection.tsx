import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { HOME_FAQS } from "@/app/lib/faqs";

/**
 * The homepage's FAQ entries, reused verbatim from app/lib/faqs.ts (the same
 * entries /faq shows), with FAQPage JSON-LD built from exactly what renders.
 * Static server-rendered cards: no accordion state, nothing to shift.
 */
export const HomeFaqSection = () => {
  const items = HOME_FAQS.filter(Boolean);
  if (items.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section aria-labelledby="home-faq-heading" className="py-12 sm:py-14">
      <JsonLd data={faqSchema} />
      <Container className="space-y-6">
        <h2
          id="home-faq-heading"
          className="border-l-[3px] border-[color:var(--color-primary)] pl-4 font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
        >
          Common questions
        </h2>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.question}
              className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-soft"
            >
              <h3 className="font-display text-base font-bold text-[color:var(--color-ink)]">
                {item.question}
              </h3>
              <p className="text-[13px] leading-relaxed text-[color:var(--color-ink-muted)]">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
        <p className="pl-4 text-sm text-[color:var(--color-ink-muted)]">
          Sizes, payment, order limits and returns are covered in the{" "}
          <Link
            href="/faq"
            className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
          >
            full FAQ
          </Link>
          .
        </p>
      </Container>
    </section>
  );
};
