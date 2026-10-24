import type { HTMLAttributes } from "react";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export const SectionHeading = ({
  title,
  subtitle,
  align = "left",
  className = "",
  ...props
}: SectionHeadingProps) => {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignment} ${className}`} {...props}>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-[color:var(--color-ink-muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

