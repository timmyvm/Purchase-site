const trustItems = [
  {
    label: "Designed in Melbourne",
    icon: (
      <>
        <path d="M4 10 12 5l8 5" />
        <path d="M6 10v8h12v-8" />
        <path d="M10 18v-5h4v5" />
      </>
    ),
  },
  {
    label: "Limited Print Runs",
    icon: (
      <>
        <path d="M5 4h10l4 4v12H5z" />
        <path d="M15 4v4h4" />
        <path d="M9 13h6" />
        <path d="M9 16h4" />
      </>
    ),
  },
  {
    label: "Posted Australia-Wide",
    icon: (
      <>
        <path d="M3 14h10v4H3z" />
        <path d="M13 16h3l2-3h2v5h-2" />
        <circle cx="7" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </>
    ),
  },
  {
    label: "Die-Cut Vinyl",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v4" />
        <path d="M20 12h-4" />
      </>
    ),
  },
] as const;

export const FooterTrustStrip = () => (
  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-5 py-4">
    <ul className="grid grid-cols-2 gap-3 text-sm text-[color:var(--color-ink-muted)] sm:grid-cols-4 sm:gap-4 sm:text-base">
      {trustItems.map((item) => (
        <li key={item.label} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-[color:var(--color-ink)] sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          <span className="font-semibold leading-tight">{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
);
