import type { CollectionIcon as CollectionIconName } from "@/app/lib/collections";

const paths: Record<CollectionIconName, React.ReactNode> = {
  // A die-cut sticker with a lifted corner.
  drop: (
    <>
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M15 4v4h4" />
    </>
  ),
  holo: (
    <>
      <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" />
      <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  gloss: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 9.5a4 4 0 0 1 3-2.5" />
    </>
  ),
  set: (
    <>
      <rect x="7" y="7" width="12" height="12" rx="2" />
      <path d="M5 15V7a2 2 0 0 1 2-2h8" />
    </>
  ),
};

export const CollectionIcon = ({
  icon,
  className = "h-5 w-5",
}: {
  icon: CollectionIconName;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths[icon]}
  </svg>
);
