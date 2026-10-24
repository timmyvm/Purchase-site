"use client";

import { useState } from "react";
import Link from "next/link";
import { COLLECTIONS } from "@/app/lib/collections";
import { FREE_SHIPPING_CLAIM } from "@/app/lib/shipping";
import { CollectionIcon } from "@/app/components/products/CollectionIcon";
import {
  navLinkClass,
  NavDropdownChevron,
  DROPDOWN_PANEL_BASE,
  useDropdownDismiss,
} from "@/app/components/layout/NavDropdown";

/**
 * "Shop" is a dropdown organised by collection (drop, finish, sets), so the
 * shape of the catalogue is visible from the top nav instead of collapsing
 * into one flat link.
 */

/**
 * Desktop: CSS-only hover/focus dropdown. The collection links must stay in
 * the server-rendered markup so they remain crawlable, so the open state lives
 * in `group-hover` / `group-focus-within` — never in React state. The panel's
 * top padding bridges the gap to the trigger so the pointer never leaves the
 * group on the way down (this replaces the old 120ms close timer).
 * `useDropdownDismiss` closes it after a click by dropping the reveal
 * variants — it never unmounts the links.
 */
export const ShopDropdown = ({ active }: { active: boolean }) => {
  const { reveal, armed, groupProps } = useDropdownDismiss();

  return (
    <div className="group relative" {...groupProps}>
      <Link
        href="/shop"
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 ${navLinkClass(active, true)}`}
      >
        Shop
        <NavDropdownChevron armed={armed} />
      </Link>

      <div
        className={`${DROPDOWN_PANEL_BASE} w-[min(40rem,calc(100vw-4rem))] ${reveal}`}
      >
        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] shadow-card">
          <div className="grid grid-cols-2 gap-1 p-3">
            {COLLECTIONS.map((area) => (
              <Link
                key={area.slug}
                href={`/collections/${area.slug}`}
                className="group/item flex items-start gap-3 rounded-xl p-3 transition hover:bg-[color:var(--color-surface)]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-primary)] transition group-hover/item:border-[color:var(--color-primary-soft)]">
                  <CollectionIcon icon={area.icon} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[color:var(--color-ink)]">
                    {area.label}
                  </span>
                  <span className="line-clamp-1 block text-[11.5px] text-[color:var(--color-ink-muted)]">
                    {area.blurb}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
            <Link
              href="/shop"
              className="text-xs font-semibold text-[color:var(--color-primary)] transition hover:text-[color:var(--color-primary-soft)]"
            >
              View all stickers →
            </Link>
            <Link
              href="/shipping-policy"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
            >
              {FREE_SHIPPING_CLAIM}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Mobile drawer: collapsible "Shop by collection" accordion. */
export const ShopDrawerSection = ({ onNavigate }: { onNavigate: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-[color:var(--color-ink-muted)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-ink)]"
      >
        <span>Shop by collection</span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      {open ? (
        <div className="mt-0.5 space-y-0.5 pb-1 pl-2">
          {COLLECTIONS.map((area) => (
            <Link
              key={area.slug}
              href={`/collections/${area.slug}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px] text-[color:var(--color-ink-muted)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-ink)]"
            >
              <span className="text-[color:var(--color-primary)]">
                <CollectionIcon icon={area.icon} className="h-4 w-4" />
              </span>
              {area.label}
            </Link>
          ))}
          <Link
            href="/shop"
            onClick={onNavigate}
            className="block rounded-lg px-4 py-2.5 text-[13px] font-semibold text-[color:var(--color-primary)]"
          >
            View all stickers →
          </Link>
        </div>
      ) : null}
    </div>
  );
};
