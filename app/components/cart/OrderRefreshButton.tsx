"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";

/** Re-renders the server order page in place (status, tracking, payment). */
export const OrderRefreshButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      className="h-8 px-3 py-0 text-xs"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
    >
      {pending ? "Refreshing…" : "Refresh"}
    </Button>
  );
};
