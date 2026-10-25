import type { StoredOrder } from "@/app/lib/orders";
import { formatOrderDate } from "@/app/components/cart/order-dates";

type StepState = "done" | "current" | "upcoming" | "cancelled";

type Step = {
  key: string;
  label: string;
  state: StepState;
  /** A date for a reached step, or what's happening now for the current one. */
  caption: string | null;
};

type TimelineOrder = Pick<StoredOrder, "status" | "createdAt" | "paidAt" | "shippedAt" | "cancelledAt">;

// Index of the step in progress for each live status; "completed" is past
// the last step, so every bead reads done.
const CURRENT_STEP: Record<Exclude<StoredOrder["status"], "cancelled">, number> = {
  pending: 1,
  paid: 2,
  shipped: 3,
  completed: 4,
};

const CURRENT_CAPTION: Record<number, string> = {
  1: "Awaiting payment",
  2: "Packing",
  3: "In the post",
};

const buildSteps = (order: TimelineOrder): Step[] => {
  const placed: Step = {
    key: "placed",
    label: "Placed",
    state: "done",
    caption: formatOrderDate(order.createdAt),
  };

  if (order.status === "cancelled") {
    // Only what actually happened, then the cancellation.
    const steps: Step[] = [placed];
    if (order.paidAt) {
      steps.push({ key: "paid", label: "Paid", state: "done", caption: formatOrderDate(order.paidAt) });
    }
    if (order.shippedAt) {
      steps.push({ key: "posted", label: "Posted", state: "done", caption: formatOrderDate(order.shippedAt) });
    }
    steps.push({
      key: "cancelled",
      label: "Cancelled",
      state: "cancelled",
      caption: formatOrderDate(order.cancelledAt),
    });
    return steps;
  }

  const current = CURRENT_STEP[order.status];
  const stateFor = (index: number): StepState =>
    index < current ? "done" : index === current ? "current" : "upcoming";
  const captionFor = (index: number, at: string | null) =>
    index < current ? formatOrderDate(at) : index === current ? (CURRENT_CAPTION[index] ?? null) : null;

  return [
    placed,
    { key: "paid", label: "Paid", state: stateFor(1), caption: captionFor(1, order.paidAt) },
    { key: "posted", label: "Posted", state: stateFor(2), caption: captionFor(2, order.shippedAt) },
    { key: "completed", label: "Completed", state: stateFor(3), caption: captionFor(3, null) },
  ];
};

const beadClass = (state: StepState) => {
  switch (state) {
    case "done":
    case "current":
      return "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white";
    case "cancelled":
      return "border-[color:var(--color-danger)] bg-[color:var(--color-danger)] text-white";
    default:
      return "border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink-muted)]";
  }
};

const labelClass = (state: StepState) => {
  switch (state) {
    case "current":
      return "text-[color:var(--color-primary)]";
    case "cancelled":
      return "text-[color:var(--color-danger)]";
    case "done":
      return "text-[color:var(--color-ink)]";
    default:
      return "text-[color:var(--color-ink-muted)]";
  }
};

const connectorClass = (next: Step | undefined) => {
  if (!next || next.state === "upcoming") return "bg-[color:var(--color-border)]";
  return next.state === "cancelled"
    ? "bg-[color:var(--color-danger)]/50"
    : "bg-[color:var(--color-primary)]";
};

const BeadMark = ({ state }: { state: StepState }) =>
  state === "done" ? (
    <span aria-hidden="true">✓</span>
  ) : state === "cancelled" ? (
    <span aria-hidden="true">✕</span>
  ) : null;

const stateText: Record<StepState, string> = {
  done: "done",
  current: "in progress",
  upcoming: "not yet",
  cancelled: "",
};

/**
 * Placed → Paid → Posted → Completed, or the steps that happened followed by
 * Cancelled. Phone: stacked list. sm+: APL's bead timeline.
 */
export const OrderTimeline = ({ order }: { order: TimelineOrder }) => {
  const steps = buildSteps(order);

  return (
    <>
      <ol className="grid gap-2 sm:hidden">
        {steps.map((step) => (
          <li
            key={step.key}
            className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs ${
              step.state === "current"
                ? "border-[color:var(--color-primary-soft)] bg-[color:var(--color-surface)]"
                : step.state === "done"
                  ? "border-[color:var(--color-success)]/40 bg-[color:var(--color-surface)]"
                  : step.state === "cancelled"
                    ? "border-[color:var(--color-danger)]/40 bg-[color:var(--color-surface)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${beadClass(step.state)}`}
              >
                <BeadMark state={step.state} />
              </span>
              <span className={`font-semibold uppercase tracking-[0.14em] ${labelClass(step.state)}`}>
                {step.label}
              </span>
              {stateText[step.state] ? <span className="sr-only">({stateText[step.state]})</span> : null}
            </span>
            {step.caption ? (
              <span className="text-[color:var(--color-ink-muted)]">{step.caption}</span>
            ) : null}
          </li>
        ))}
      </ol>

      <ol className="hidden items-start sm:flex">
        {steps.map((step, index) => (
          <li key={step.key} className="relative flex-1">
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-4 h-[2px] w-full -translate-y-1/2 ${connectorClass(steps[index + 1])}`}
              />
            ) : null}
            <div className="relative z-10 mx-auto flex h-8 w-8 items-center justify-center">
              {step.state === "current" ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-[color:var(--color-primary)]/50 motion-safe:animate-ping"
                />
              ) : null}
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${beadClass(step.state)}`}
              >
                <BeadMark state={step.state} />
              </span>
            </div>
            <p
              className={`mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] ${labelClass(step.state)}`}
            >
              {step.label}
              {stateText[step.state] ? <span className="sr-only"> ({stateText[step.state]})</span> : null}
            </p>
            {step.caption ? (
              <p className="mt-0.5 text-center text-[11px] text-[color:var(--color-ink-muted)]">
                {step.caption}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
};
