type ProductGridSkeletonProps = {
  count?: number;
  className?: string;
  gridClassName?: string;
};

/** Placeholder grid that reserves the real grid's space (no layout shift). */
export const ProductGridSkeleton = ({
  count = 8,
  className = "",
  gridClassName = "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}: ProductGridSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex h-full flex-col gap-4 rounded-[4px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4 shadow-none"
        >
          <div className="aspect-[4/5] w-full animate-pulse rounded-[4px] bg-[color:var(--color-surface)]" />
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[color:var(--color-surface)]" />
            <div className="h-3 w-full animate-pulse rounded-full bg-[color:var(--color-surface)]" />
          </div>
          <div className="mt-auto h-9 w-full animate-pulse rounded-full bg-[color:var(--color-surface)]" />
        </div>
      ))}
    </div>
  </div>
);
