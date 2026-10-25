import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Input } from "@/app/components/ui/Input";

type CheckoutFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  name: string;
  label: string;
  /** Shown under the input in red; also sets aria-invalid. */
  error?: string | null;
  /** Small muted line under the input (hidden while an error shows). */
  hint?: ReactNode;
  /** Adds "(optional)" to the label. Required fields get " *". */
  optional?: boolean;
  className?: string;
};

/**
 * Label + input + inline error, the checkout and Track Order forms' one field
 * shape. Same label styling as APL's FormField; the error is tied to the input
 * with aria-describedby so screen readers announce it on focus.
 */
export const CheckoutField = forwardRef<HTMLInputElement, CheckoutFieldProps>(
  ({ name, label, error, hint, optional = false, required, className = "", id, ...inputProps }, ref) => {
    const inputId = id ?? `field-${name}`;
    const messageId = `${inputId}-message`;
    const message = error || hint;

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <label htmlFor={inputId} className="text-sm font-medium text-[color:var(--color-ink)]">
          {label}
          {required ? " *" : null}
          {optional ? (
            <span className="font-normal text-[color:var(--color-ink-subtle)]"> (optional)</span>
          ) : null}
        </label>
        <Input
          ref={ref}
          id={inputId}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          // Variant classes sort after the Input's base border/ring utilities,
          // so the error colour wins without relying on class order.
          className="aria-[invalid=true]:border-[color:var(--color-danger)] aria-[invalid=true]:focus:border-[color:var(--color-danger)] aria-[invalid=true]:focus:ring-[color:var(--color-danger)]/40"
          {...inputProps}
        />
        {error ? (
          <p id={messageId} className="text-xs font-medium text-[color:var(--color-danger)]">
            {error}
          </p>
        ) : hint ? (
          <p id={messageId} className="text-xs text-[color:var(--color-ink-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

CheckoutField.displayName = "CheckoutField";
