import type { Metadata } from "next";
import { FaqContactCta } from "@/app/components/sections/FaqContactCta";
import { FaqsPageClient, toFaqSections } from "@/app/components/sections/FaqsPageClient";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { FAQ_GROUPS } from "@/app/lib/faqs";
import { BUSINESS } from "@/app/lib/business-identity";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers about ${BUSINESS.tradingName} stickers: what a limited run means, materials and sizes, paying by bank transfer, shipping costs and times, and damaged orders.`,
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const sections = toFaqSections(FAQ_GROUPS);
  // Exactly the entries the page renders, in the same order, with the
  // answers verbatim from app/lib/faqs.ts.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      }))
    ),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <FaqsPageClient
        title="Frequently Asked Questions"
        subtitle="Limited runs, materials and sizes, paying for your order, and getting it delivered."
        sections={sections}
        bottomSlot={<FaqContactCta />}
      />
    </>
  );
}
