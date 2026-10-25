import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { JsonLd } from "@/app/components/sections/JsonLd";
import {
  describeRuns,
  getDropFacts,
  joinWithAnd,
} from "@/app/components/sections/AboutDropFacts";
import { DAMAGE_CLAIM_WINDOW_DAYS, formatAudShort } from "@/app/components/sections/PolicyFacts";
import {
  BUSINESS,
  BUSINESS_DISPATCH_LOCATION,
  BUSINESS_ENTITY_WITH_ABN,
} from "@/app/lib/business-identity";
import { MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import { getCollection } from "@/app/lib/collections";
import { getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { buildOrganizationSchema } from "@/app/lib/organization-schema";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";
import { DISPATCH_CLAIM_SHORT, SHIPPING_FACTS } from "@/app/lib/shipping";
import { SITE } from "@/app/lib/site";

const PAGE_TITLE = `About ${BUSINESS.tradingName}`;
const CURRENT_DROP_SLUG = "drop-01";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: `${BUSINESS.tradingName} makes limited-run die-cut vinyl stickers in ${BUSINESS.dispatchFrom.city}. Each design is printed once and retired when its run sells out. How a drop works, from print run to post.`,
  alternates: { canonical: "/about" },
};

const linkClass = "font-semibold text-[color:var(--color-primary)] hover:underline";

// Commitments the site already keeps, not aspirations: each one is enforced
// in code (edition_size, the per-line cap, the unpaid-order cron) or in the
// copy rules in CLAUDE.md.
const values = [
  "Limited means limited. Each design is printed once, in the run shown on its page, and isn't reprinted when that run sells out.",
  "The numbers are real. The run size on a product page is what was printed, and there are no countdown timers, invented stock warnings or made-up reviews.",
  `Fair shares of every run. Orders are capped at ${MAX_QUANTITY_PER_ITEM} of each design and size, and unpaid orders are released after ${UNPAID_ORDER_HOURS} hours so stock goes back on sale.`,
];

export default async function AboutPage() {
  const drop = getCollection(CURRENT_DROP_SLUG);
  const products = await getStorefrontProducts();
  const facts = getDropFacts(drop ? products.filter(drop.match) : []);
  const baseUrl = getBaseUrl();

  // mainEntity is the same Organization the homepage and /contact emit
  // (app/lib/organization-schema.ts), so the pages can't disagree.
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: PAGE_TITLE,
    url: `${baseUrl}/about`,
    inLanguage: "en-AU",
    mainEntity: buildOrganizationSchema(),
  };

  const steps = [
    {
      title: "A drop is released",
      body: facts
        ? `New designs are released together as a drop. ${drop ? `${drop.label.split(" · ")[0]} has` : "The current drop has"} ${facts.designCount} designs, each available in ${joinWithAnd(facts.sizes)}.`
        : "New designs are released together as a drop, each available in more than one size.",
    },
    {
      title: "Each design is printed once",
      body: facts
        ? `The run size is on every product page: ${describeRuns(facts)}. When a run sells out, the design is retired.`
        : "The run size is on every product page. When a run sells out, the design is retired.",
    },
    {
      title: "You order, then pay",
      body: `Pay by bank transfer with your order number as the reference. Your stickers are held for ${UNPAID_ORDER_HOURS} hours while the payment comes through.`,
    },
    {
      title: "We post it",
      body: `${DISPATCH_CLAIM_SHORT}, by ${SHIPPING_FACTS.carrier} in a rigid mailer so the stickers arrive flat.`,
    },
  ];

  const showEntityLine = Boolean(BUSINESS.legalName || BUSINESS.abn);

  return (
    <section className="py-14 sm:py-18 lg:py-22">
      <JsonLd data={aboutSchema} />
      <Container className="max-w-5xl space-y-10">
        <div className="overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-card">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.07),transparent_42%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.05),transparent_30%)] px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
            <div className="max-w-3xl space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-primary-soft)]">
                About Us
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[color:var(--color-ink)] sm:text-5xl">
                {PAGE_TITLE}
              </h1>
              <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)] sm:text-lg">
                {SITE.brand.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <article className="space-y-6 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-6 py-8 shadow-card sm:px-8 sm:py-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">
              Who we are
            </h2>
            <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
              {BUSINESS.tradingName} is a sticker shop in {BUSINESS.dispatchFrom.city},{" "}
              {BUSINESS.dispatchFrom.state}. We release designs in drops, and every design is a
              single limited print run: once it sells out, it&apos;s retired and not reprinted.
            </p>
            {drop ? (
              <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                {drop.description}{" "}
                <Link href={`/collections/${drop.slug}`} className={linkClass}>
                  See {drop.label}
                </Link>
                .
              </p>
            ) : null}
            {facts ? (
              <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                The stickers are die-cut vinyl in {joinWithAnd(facts.finishes.map((f) => f.toLowerCase()))}{" "}
                finishes, in {joinWithAnd(facts.sizes)}.{" "}
                {describeRuns(facts).replace(/^./, (first) => first.toUpperCase())}
                {facts.setEditions > 0
                  ? `, and there are ${facts.setEditions} full sets with every design in the drop`
                  : ""}
                .
              </p>
            ) : null}
            <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
              Every order is packed and posted from {BUSINESS_DISPATCH_LOCATION}.{" "}
              {DISPATCH_CLAIM_SHORT}, Australia-wide.
            </p>
          </article>

          <aside className="space-y-4 rounded-[2rem] border border-[rgba(59,130,246,0.22)] bg-[linear-gradient(180deg,rgba(59,130,246,0.06),rgba(248,250,252,0.98))] px-6 py-8 shadow-card sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-primary-soft)]">
              What matters most to us
            </p>
            <div className="space-y-3">
              {values.map((value) => (
                <div
                  key={value}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-white/80 px-4 py-4"
                >
                  <p className="text-sm leading-relaxed text-[color:var(--color-ink)]">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section aria-labelledby="how-a-drop-works" className="space-y-6">
          <h2
            id="how-a-drop-works"
            className="font-display text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]"
          >
            How a drop works
          </h2>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full space-y-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] font-display text-sm font-bold text-[color:var(--color-primary)]"
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-[color:var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                    {step.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-soft">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-soft)]">
              Where we post from
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              Orders go out from {BUSINESS_DISPATCH_LOCATION} by {SHIPPING_FACTS.carrier}, to
              Australian addresses only. The details are in our{" "}
              <Link href="/shipping-policy" className={linkClass}>
                shipping policy
              </Link>
              .
            </p>
          </section>
          <section className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-soft">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-soft)]">
              What shipping costs
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              {formatAudShort(SHIPPING_FACTS.feeAud)} per order Australia-wide, and free on orders
              of {formatAudShort(SHIPPING_FACTS.freeThresholdAud)} or more. The cart shows it
              before you check out.
            </p>
          </section>
          <section className="rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-soft">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-soft)]">
              If something goes wrong
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
              Email us a photo within {DAMAGE_CLAIM_WINDOW_DAYS} days of delivery and damaged
              stickers are replaced, or refunded if the design has sold out. See the{" "}
              <Link href="/refund-policy" className={linkClass}>
                refund &amp; replacement policy
              </Link>
              .
            </p>
          </section>
        </div>

        <article className="space-y-5 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-6 py-8 shadow-card sm:px-8 sm:py-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]">
            Have a look through the drop
          </h2>
          <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
            Every design&apos;s page shows its finish, sizes and run size. Questions about an
            order, a design or shipping? The{" "}
            <Link href="/faq" className={linkClass}>
              FAQ
            </Link>{" "}
            covers the common ones, and you can{" "}
            <Link href="/contact" className={linkClass}>
              contact us
            </Link>{" "}
            by email for anything else.
          </p>
          <LinkButton href="/shop" variant="cta" className="w-full sm:w-auto">
            Shop the stickers
          </LinkButton>

          <div className="space-y-2 border-t border-[color:var(--color-border)] pt-6">
            <p className="text-base font-semibold text-[color:var(--color-ink)]">
              {BUSINESS.tradingName}
            </p>
            {showEntityLine ? (
              <p className="text-sm text-[color:var(--color-ink-muted)]">{BUSINESS_ENTITY_WITH_ABN}</p>
            ) : null}
            {BUSINESS.email ? (
              <p className="text-sm text-[color:var(--color-ink-muted)]">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="transition hover:text-[color:var(--color-ink)]"
                >
                  {BUSINESS.email}
                </a>
              </p>
            ) : null}
            <div className="pt-4">
              <LogoMark className="h-14 max-w-[12rem]" alt="" />
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
