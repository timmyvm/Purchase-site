import { safeJsonLd } from "@/app/lib/json-ld";

/** Inline JSON-LD. Markup only ever describes what the page visibly shows. */
export const JsonLd = ({ data }: { data: unknown }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
);
