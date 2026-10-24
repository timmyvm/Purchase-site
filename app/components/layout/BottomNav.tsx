"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/providers/CartProvider";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M5 6h16l-1.4 7.5a2 2 0 0 1-2 1.5H8.4a2 2 0 0 1-2-1.6L4 3H2" />
  </svg>
);

const TrackIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

export const BottomNav = () => {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const itemCls = (href: string) =>
    `flex flex-col items-center gap-1 min-w-0 flex-1 py-2 text-[10px] font-medium transition-colors ${
      isActive(href)
        ? "text-[color:var(--color-primary)]"
        : "text-[color:var(--color-ink-muted)]"
    }`;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-charcoal)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="flex items-stretch">
        <Link href="/" className={itemCls("/")} aria-label="Home">
          <HomeIcon />
          <span>Home</span>
        </Link>

        <Link href="/shop" className={itemCls("/shop")} aria-label="Shop">
          <ShopIcon />
          <span>Shop</span>
        </Link>

        {/* The Cart tab lands on the full /cart page, not the drawer. */}
        <Link
          href="/cart"
          className={`flex flex-col items-center gap-1 min-w-0 flex-1 py-2 text-[10px] font-medium transition-colors relative ${
            isActive("/cart") || itemCount > 0
              ? "text-[color:var(--color-primary)]"
              : "text-[color:var(--color-ink-muted)]"
          }`}
          aria-label={`Cart, ${itemCount} items`}
        >
          <span className="relative">
            <CartIcon />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-primary)] px-1 text-[9px] font-bold leading-none text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </span>
          <span>Cart</span>
        </Link>

        <Link href="/order-status" className={itemCls("/order-status")} aria-label="Track order">
          <TrackIcon />
          <span>Track</span>
        </Link>
      </div>
    </nav>
  );
};
