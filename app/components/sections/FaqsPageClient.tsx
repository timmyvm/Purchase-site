import type { ReactNode } from "react";
import { Container } from "@/app/components/ui/Container";
import { FaqItem } from "@/app/components/sections/FaqItem";
import type { Faq, FaqGroup } from "@/app/lib/faqs";

export type FaqSection = {
  id: string;
  heading: string;
  items: Array<Faq & { id: string }>;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * FAQ_GROUPS in page order with stable anchor ids ("#shipping-returns").
 * Shared by the page render and the FAQPage JSON-LD so the markup lists
 * exactly the questions shown, in the order they're shown.
 */
export const toFaqSections = (groups: FaqGroup[]): FaqSection[] =>
  groups
    .filter((group) => group.items.length > 0)
    .map((group) => {
      const id = slugify(group.heading);
      return {
        id,
        heading: group.heading,
        items: group.items.map((item, index) => ({ ...item, id: `${id}-${index + 1}` })),
      };
    });

type FaqsPageClientProps = {
  title: string;
  subtitle?: string;
  sections: FaqSection[];
  /** Rendered after the accordion (the "still have a question?" CTA). */
  bottomSlot?: ReactNode;
};

// Server component: only the accordion items (FaqItem) hydrate.
export const FaqsPageClient = ({ title, subtitle, sections, bottomSlot }: FaqsPageClientProps) => (
  <section className="bg-transparent py-16 sm:py-20">
    <Container className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-base text-[color:var(--color-ink-muted)]">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-10">
        {sections.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-heading`}
            className="scroll-mt-36 space-y-4"
          >
            <h2
              id={`${group.id}-heading`}
              className="font-display text-xl font-semibold text-[color:var(--color-ink)] sm:text-2xl"
            >
              {group.heading}
            </h2>
            <div className="space-y-4">
              {group.items.map((item) => (
                <FaqItem key={item.id} id={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {bottomSlot}
    </Container>
  </section>
);
