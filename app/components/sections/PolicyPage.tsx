import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/app/components/ui/Container";
import { BUSINESS } from "@/app/lib/business-identity";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-10-25" → "25 October 2026", with no timezone or locale involved. */
const formatPolicyDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
};

type PolicyPageProps = {
  title: string;
  /** ISO date ("2026-10-25"), shown as "Last updated 25 October 2026". */
  lastUpdated: string;
  children: ReactNode;
};

/**
 * Shared shell for the four policy pages: the same header block, width and
 * prose typography on each, so they read as one set.
 */
export const PolicyPage = ({ title, lastUpdated, children }: PolicyPageProps) => (
  <section className="bg-transparent py-16 sm:py-20">
    <Container className="space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]">
          Last updated <time dateTime={lastUpdated}>{formatPolicyDate(lastUpdated)}</time>
        </p>
        <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)] sm:text-4xl">
          {title}
        </h1>
      </div>

      <div className="space-y-8 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
        {children}
      </div>
    </Container>
  </section>
);

export const PolicySection = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="font-display text-2xl font-semibold text-[color:var(--color-ink)]">{heading}</h2>
    {children}
  </section>
);

export const PolicyList = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const policyLinkClass = "text-[color:var(--color-primary)] underline";

export const PolicyLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className={policyLinkClass}>
    {children}
  </Link>
);

/**
 * "email us at hello@…" while a support inbox is configured, otherwise
 * "send us a message through our contact page". Written to sit mid-sentence
 * either way, so no policy ever prints a placeholder address.
 */
export const PolicyContact = () =>
  BUSINESS.email ? (
    <>
      email us at{" "}
      <a href={`mailto:${BUSINESS.email}`} className={policyLinkClass}>
        {BUSINESS.email}
      </a>
    </>
  ) : (
    <>
      send us a message through our <PolicyLink href="/contact">contact page</PolicyLink>
    </>
  );

export type PolicyFactRow = { label: string; value: ReactNode };

/** Label/value table (striped), as the shipping policy states its facts. */
export const PolicyFactsTable = ({ rows }: { rows: PolicyFactRow[] }) => (
  <div className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)]">
    <table className="w-full text-left text-sm">
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.label}
            className={
              index % 2 === 0
                ? "bg-[color:var(--color-surface)]"
                : "bg-[color:var(--color-surface-elevated)]"
            }
          >
            <th
              scope="row"
              className="w-2/5 px-4 py-3 align-top font-semibold text-[color:var(--color-ink)]"
            >
              {row.label}
            </th>
            <td className="px-4 py-3 align-top text-[color:var(--color-ink-muted)]">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
