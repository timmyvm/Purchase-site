import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { FooterTrustStrip } from "@/app/components/layout/FooterTrustStrip";
import { BUSINESS, BUSINESS_ENTITY_WITH_ABN } from "@/app/lib/business-identity";
import { SITE } from "@/app/lib/site";

const primaryLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Refund & Replacement Policy", href: "/refund-policy" },
  { label: "Terms & Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Contact", href: "/contact" },
];

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const Footer = () => {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim();
  // Only accounts that exist get a button.
  const socialLinks = [
    instagram ? { label: "Instagram", href: instagram, icon: <InstagramIcon /> } : null,
    BUSINESS.email
      ? { label: "Email us", href: `mailto:${BUSINESS.email}`, icon: <MailIcon /> }
      : null,
  ].filter((link): link is { label: string; href: string; icon: React.ReactElement } => link !== null);

  // The mobile bottom nav is fixed (56px + safe area) and used to sit on top of
  // the social buttons — the footer clears that height on small screens only.
  return (
    <footer className="mt-10 border-t border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] pb-[calc(72px+env(safe-area-inset-bottom))] text-[color:var(--color-ink-muted)] md:pb-0">
      <Container className="space-y-4 py-6">
        <FooterTrustStrip />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[color:var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            aria-label={SITE.brand.name}
            className="mx-auto text-[color:var(--color-ink)] sm:mx-0"
          >
            <LogoMark className="h-14 max-w-[11rem] sm:max-w-none" alt="" />
          </Link>
          {/* Business identity reads app/lib/business-identity.ts, the same
              source as checkout and the policy pages. */}
          <div className="space-y-1 text-center text-[11px] sm:col-start-2">
            <p className="font-semibold text-[color:var(--color-ink)]">
              {BUSINESS_ENTITY_WITH_ABN}
            </p>
            {BUSINESS.email ? (
              <p>
                <a href={`mailto:${BUSINESS.email}`} className="transition hover:text-[color:var(--color-ink)]">
                  {BUSINESS.email}
                </a>
              </p>
            ) : null}
            <p>{SITE.copyright}</p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:items-end">
            <div className="flex items-center justify-center gap-2 sm:justify-end">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink-muted)] transition hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-ink)]"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
