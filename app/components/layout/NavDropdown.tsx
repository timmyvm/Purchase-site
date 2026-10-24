"use client";

import { useState, type FocusEvent } from "react";
import Link from "next/link";

export type NavDropdownItem = { label: string; href: string };

/**
 * Shared nav-item typography. The hierarchy is deliberate: `primary` (Shop)
 * reads at full ink weight, its peers sit muted, and the active route is the
 * only thing in brand blue. `whitespace-nowrap` is load-bearing — "About Us"
 * and "Track Order" used to wrap to two lines and break the row's baseline.
 */
export const navLinkClass = (isActive: boolean, primary = false) =>
  `whitespace-nowrap rounded-md py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-charcoal)] ${
    isActive
      ? "font-semibold text-[color:var(--color-primary)]"
      : primary
        ? "font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-primary)]"
        : "font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
  }`;

/**
 * Closes a CSS-only dropdown after a click without ever unmounting its links.
 *
 * Clicking a link navigates, but the pointer is left sitting over the panel —
 * so `group-hover` keeps the menu open on the newly loaded page. This drops the
 * reveal variants off the panel for as long as that lasts, then re-arms them
 * once the pointer leaves the group (or focus moves out of it). Only the
 * *classes* change: the child links stay rendered the whole time, so this can
 * never take them out of the crawlable markup.
 */
const useDropdownDismiss = () => {
  const [dismissed, setDismissed] = useState(false);
  const rearm = () => setDismissed(false);

  return {
    /** Reveal variants, or nothing at all while dismissed. */
    reveal: dismissed
      ? ""
      : "group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
    armed: !dismissed,
    /** Spread onto the `group` wrapper — clicks from any child link bubble here. */
    groupProps: {
      onClick: () => setDismissed(true),
      onMouseLeave: rearm,
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        // Navigating away blurs the clicked link with a null relatedTarget, which
        // would re-arm mid-close — and because the panel is still mid-fade the
        // pointer is technically still inside the group, so `group-hover` would
        // pull it straight back open. While the pointer is here, leave the
        // re-arming to onMouseLeave; this branch is for keyboard exits.
        if (event.currentTarget.matches(":hover")) return;
        rearm();
      },
    },
  };
};

export const NavDropdownChevron = ({ armed = true }: { armed?: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={`h-3.5 w-3.5 transition-transform duration-200 ${
      armed ? "group-hover:rotate-180 group-focus-within:rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 8l5 5 5-5" />
  </svg>
);

/** Base panel classes, minus the reveal variants `useDropdownDismiss` owns. */
export const DROPDOWN_PANEL_BASE =
  "invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-[opacity,visibility] duration-150";

/**
 * CSS-only dropdown. The panel is ALWAYS in the server-rendered markup and is
 * hidden with visibility + opacity — never conditionally rendered. Mounting it
 * behind React state would strip these internal links out of the HTML crawlers
 * see, which is why the open state lives in `group-hover` / `group-focus-within`
 * and not in `useState`. `invisible` also keeps the links out of the tab order
 * while closed, so keyboard order stays correct, and the panel's top padding
 * bridges the gap to the trigger so the pointer never leaves the group.
 */
export const NavDropdown = ({
  label,
  items,
  active,
}: {
  label: string;
  items: NavDropdownItem[];
  active: boolean;
}) => {
  const { reveal, armed, groupProps } = useDropdownDismiss();

  return (
    <div className="group relative" {...groupProps}>
      <button
        type="button"
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 ${navLinkClass(active)}`}
      >
        {label}
        <NavDropdownChevron armed={armed} />
      </button>

      <div className={`${DROPDOWN_PANEL_BASE} w-56 ${reveal}`}>
        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] py-2 shadow-card">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block whitespace-nowrap px-4 py-2.5 text-sm font-medium text-[color:var(--color-ink-muted)] transition hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-ink)] focus-visible:bg-[color:var(--color-surface)] focus-visible:text-[color:var(--color-ink)] focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export { useDropdownDismiss };
