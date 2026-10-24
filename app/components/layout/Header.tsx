"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HeaderProductSearch } from "@/app/components/layout/HeaderProductSearch";
import { Container } from "@/app/components/ui/Container";
import { useCart } from "@/app/providers/CartProvider";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { CartDrawer } from "@/app/components/cart/CartDrawer";
import { useScrollLock } from "@/app/hooks/useScrollLock";
import { ShopDropdown, ShopDrawerSection } from "@/app/components/layout/ShopNav";
import { NavDropdown, navLinkClass } from "@/app/components/layout/NavDropdown";
import type { NavProduct } from "@/app/lib/nav-products";
import { SITE } from "@/app/lib/site";

// The "Shop" nav item is rendered as a collections dropdown instead of a flat
// link; matched by its href so it survives nav edits.
const SHOP_HREF = "/shop";

// One offer at a time — three at once read loud and cheap.
const PROMO_ROTATE_MS = 5000;

// Search and order tracking are ghosts so the solid blue cart is the only
// weighted target in the cluster.
const GHOST_ICON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-ink-muted)] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-charcoal)]";

const TrackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

type HeaderProps = {
  products: NavProduct[];
  promoMessages: readonly string[];
};

const PROMO_BANNER_STORAGE_KEY = "promo-banner-dismissed-v2";


export const Header = ({ products, promoMessages }: HeaderProps) => {
  const site = SITE;
  const pathname = usePathname();
  const { itemCount, registerOpenCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (window.sessionStorage.getItem(PROMO_BANNER_STORAGE_KEY) === "true") {
      setBannerDismissed(true);
    }
  }, []);

  useEffect(() => {
    registerOpenCart(() => setCartOpen(true));
  }, [registerOpenCart]);

  // Offers rotate as overlapping pairs — [1,2] → [2,3] → [3,1] — so each one
  // gets two turns on screen and the bar never reads like a single ticker. Two
  // or fewer messages can't overlap, so they render as one static pair.
  const promoPairs: Array<[string, string | undefined]> =
    promoMessages.length === 0
      ? []
      : promoMessages.length > 2
        ? promoMessages.map((message, index) => [
            message,
            promoMessages[(index + 1) % promoMessages.length],
          ])
        : [[promoMessages[0], promoMessages[1]]];
  const promoPairCount = promoPairs.length;

  // The index starts at 0 so the server and the first client paint agree, and
  // every pair stays mounted (see the bar below) so rotating can never change
  // the bar's height. prefers-reduced-motion pins the first pair and never
  // starts the interval.
  useEffect(() => {
    if (promoPairCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rotation = window.setInterval(
      () => setPromoIndex((index) => (index + 1) % promoPairCount),
      PROMO_ROTATE_MS
    );
    return () => window.clearInterval(rotation);
  }, [promoPairCount]);

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
    setNavSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  useScrollLock(menuOpen);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 80) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotating promo bar: exactly one 36px line at every breakpoint. Only one
  // message shows at a time and each is truncated to a single line, so the old
  // 52px phone height (which existed to fit three wrapped messages) is gone.
  // The banner, spacer, header, and slide-away transform classes below all
  // encode the same 36px; change them together. This height must never depend
  // on client-only state — the server can't know the viewport, so any
  // matchMedia/useState version corrects after hydration and shifts every
  // page (CLS).
  const showBanner = !bannerDismissed;
  const bannerHeightClass = "h-9";
  const headerHeightClass = showBanner ? "h-[132px]" : "h-24";

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    window.sessionStorage.setItem(PROMO_BANNER_STORAGE_KEY, "true");
  };

  return (
    <>
      <div
        aria-hidden="true"
        className={`transition-[height] duration-300 ease-in-out ${headerHeightClass}`}
      />
      <header
        className={`fixed inset-x-0 top-0 z-50 overflow-visible border-b border-[color:var(--color-border)] bg-[color:var(--color-charcoal)]/92 backdrop-blur transition-[height,translate] duration-200 ease-in-out ${headerHeightClass} ${
          headerHidden && !menuOpen && !cartOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`will-change-transform ${
            showBanner ? "translate-y-0" : "-translate-y-9"
          }`}
        >
          <div
              className={`border-b border-[color:var(--color-primary)]/25 bg-[color:var(--color-primary)]/10 ${bannerHeightClass}`}
            >
              <Container className="grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-[10.5px] font-medium text-[color:var(--color-primary-tint)] sm:text-[12.5px]">
                <span aria-hidden="true" className="w-7" />
                {/* Two offers at a time, sliding by one: [1,2] → [2,3] → [3,1].
                    Every pair stays mounted and absolutely stacked inside a
                    fixed-height track, so cross-fading can never resize the bar
                    — and therefore never moves the page under the fixed header.
                    The second offer is hidden below sm: a pair doesn't fit on a
                    360px phone and would truncate mid-sentence. That's a CSS
                    breakpoint, not client state, so it costs no layout shift. */}
                  <span className="relative block h-4 min-w-0">
                    {promoPairs.map(([lead, follow], index) => (
                      <span
                        key={`${lead}|${follow ?? ""}`}
                        aria-hidden={index === promoIndex ? undefined : "true"}
                        className={`absolute inset-0 truncate text-center leading-4 transition-opacity duration-500 motion-reduce:transition-none ${
                          index === promoIndex ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {lead}
                        {follow ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="hidden px-2 text-[color:var(--color-primary-tint)]/50 sm:inline sm:px-3"
                            >
                              ·
                            </span>
                            <span className="hidden sm:inline">{follow}</span>
                          </>
                        ) : null}
                      </span>
                    ))}
                  </span>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDismissBanner}
                    aria-label="Dismiss promo banner"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-[color:var(--color-ink-muted)] transition hover:bg-white/5 hover:text-[color:var(--color-primary-tint)]"
                  >
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
                      <path d="M18 6 6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </Container>
            </div>

          <Container className="relative h-24">
            {/* Logo | links | actions. A real three-column grid, so the links
                centre in the gap between the logo and the icon cluster and the
                icons stay anchored to the right edge — the old absolutely
                centred nav left dead space before the icons. */}
            <div
              className={`hidden h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 transition-opacity duration-300 md:grid lg:gap-10 ${
                navSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <Link
                href="/"
                className="flex items-center text-[color:var(--color-ink)]"
                aria-label={site.brand.name}
              >
                <LogoMark className="h-[52px] max-w-[12rem] sm:h-[58px] sm:max-w-none" />
                <span className="sr-only">{site.brand.name}</span>
              </Link>

              <nav
                aria-label={site.navigation.ariaLabel}
                className="flex items-center justify-center gap-6 text-sm lg:gap-8"
              >
                {site.navigation.links.map((link) => {
                  if (link.href === SHOP_HREF) {
                    return (
                      <ShopDropdown
                        key={link.href}
                        active={pathname === SHOP_HREF || pathname.startsWith("/collections")}
                      />
                    );
                  }

                  if (link.children) {
                    return (
                      <NavDropdown
                        key={link.label}
                        label={link.label}
                        items={link.children}
                        active={link.children.some((child) => pathname === child.href)}
                      />
                    );
                  }

                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href ?? "/"}
                      aria-current={isActive ? "page" : undefined}
                      className={navLinkClass(isActive)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label="Open product search"
                  aria-expanded={navSearchOpen}
                  onClick={() => setNavSearchOpen(true)}
                  className={GHOST_ICON_CLASS}
                >
                  <SearchIcon />
                </button>

                <Link
                  href="/order-status"
                  aria-label="Track order"
                  title="Track order"
                  className={GHOST_ICON_CLASS}
                >
                  <TrackIcon />
                </Link>
                  {/* The icon navigates to the full /cart page; the drawer
                      still pops on add-to-cart for feedback. */}
                  <Link
                    href="/cart"
                    aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
                    title="Cart"
                    className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-white shadow-soft transition hover:bg-[color:var(--color-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-charcoal)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="20" r="1.5" />
                      <circle cx="18" cy="20" r="1.5" />
                      <path d="M5 6h16l-1.4 7.5a2 2 0 0 1-2 1.5H8.4a2 2 0 0 1-2-1.6L4 3H2" />
                    </svg>
                    {itemCount > 0 ? (
                      <span className="pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--color-ink)] px-1 text-[11px] font-semibold leading-none text-white">
                        {itemCount > 9 ? "9+" : itemCount}
                      </span>
                    ) : null}
                  </Link>
              </div>
            </div>

            {/* Expanded search — its own centred overlay rather than a fourth
                grid item, so opening it can't reflow the nav on the way out. */}
            <div
              aria-hidden={!navSearchOpen}
              className={`absolute inset-x-0 top-1/2 z-[5] hidden -translate-y-1/2 transition-opacity duration-300 md:block ${
                navSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="mx-auto w-[min(42rem,calc(100vw-6rem))]">
                <HeaderProductSearch
                  products={products}
                  open={navSearchOpen}
                  onOpenChange={setNavSearchOpen}
                  expandedWidthClassName="w-full"
                />
              </div>
            </div>

            <div className="relative flex h-full items-center gap-2 md:hidden">
              {/* Burger — LEFT */}
              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink)] transition hover:border-[color:var(--color-primary-soft)] ${navSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {menuOpen ? (
                    <>
                      <path d="M18 6 6 18" />
                      <path d="M6 6l12 12" />
                    </>
                  ) : (
                    <>
                      <path d="M4 7h16" />
                      <path d="M7 12h13" />
                      <path d="M10 17h10" />
                    </>
                  )}
                </svg>
              </button>

              {/* Logo — CENTER (absolute) */}
              <Link
                href="/"
                className={`absolute left-1/2 -translate-x-1/2 flex items-center text-[color:var(--color-ink)] transition-opacity duration-300 ${
                  navSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
                aria-label={site.brand.name}
              >
                <LogoMark className="h-10 max-w-[9rem]" alt="" />
                <span className="sr-only">{site.brand.name}</span>
              </Link>

              {/* Search overlay */}
              <div
                aria-hidden={!navSearchOpen}
                className={`absolute inset-x-0 top-1/2 z-[5] -translate-y-1/2 transition-opacity duration-300 ${
                  navSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <HeaderProductSearch
                  products={products}
                  mobile
                  open={navSearchOpen}
                  onOpenChange={setNavSearchOpen}
                  className={`${navSearchOpen ? "pointer-events-auto" : "pointer-events-none"} z-[4] w-full`}
                  expandedWidthClassName="w-full"
                />
              </div>

              {/* Search button — RIGHT */}
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Open product search"
                  aria-expanded={navSearchOpen}
                  onClick={() => {
                    setMenuOpen(false);
                    setNavSearchOpen(true);
                  }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink)] transition hover:border-[color:var(--color-primary-soft)] ${navSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"}`}
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </div>
            </div>
          </Container>
        </div>

      </header>

      {/* Left-side nav drawer — mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] md:hidden transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Navigation menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-5 py-4">
          <Link href="/" onClick={() => setMenuOpen(false)} aria-label={site.brand.name}>
            <LogoMark className="h-8 max-w-[8rem]" alt="" />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label={`${site.navigation.ariaLabel} drawer`} className="flex flex-col gap-0.5 p-4">
          {site.navigation.links.map((link) => {
            if (link.href === SHOP_HREF) {
              return (
                <ShopDrawerSection
                  key={`drawer-${link.href}`}
                  onNavigate={() => setMenuOpen(false)}
                />
              );
            }

            // Grouped items (Learn) flatten into a labelled block — the drawer
            // reads the same nav data, so without this its children would
            // simply vanish from mobile.
            if (link.children) {
              return (
                <div key={`drawer-${link.label}`} className="pt-2">
                  <span className="block px-4 pb-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-subtle)]">
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={`drawer-${child.href}`}
                      href={child.href}
                      aria-current={pathname === child.href ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm transition ${
                        pathname === child.href
                          ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink)]"
                          : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-ink)]"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={`drawer-${link.href}`}
                href={link.href ?? "/"}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink)]"
                    : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 h-px bg-[color:var(--color-border)]" />

        {/* Cart / Track order */}
        <div className="flex flex-col gap-2 p-4 text-sm">
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] px-4 py-3 text-[color:var(--color-ink)] transition hover:border-[color:var(--color-primary-soft)]"
          >
            <span>Cart</span>
            <span className="text-[color:var(--color-ink-muted)]">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
          </Link>

          <Link
            href="/order-status"
            onClick={() => setMenuOpen(false)}
            className="block rounded-xl border border-[color:var(--color-border)] px-4 py-3 text-[color:var(--color-ink)] transition hover:border-[color:var(--color-primary-soft)]"
          >
            Track an order
          </Link>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};
