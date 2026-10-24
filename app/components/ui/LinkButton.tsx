import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import {
  getButtonClasses,
  type ButtonVariant,
} from "@/app/components/ui/Button";

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  disabled?: boolean;
};

export const LinkButton = ({
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}: LinkButtonProps) =>
  disabled ? (
    <span
      className={getButtonClasses(
        variant,
        `${className} pointer-events-none opacity-60`
      )}
      aria-disabled="true"
    >
      {props.children}
    </span>
  ) : (
    <Link className={getButtonClasses(variant, className)} {...props} />
  );

