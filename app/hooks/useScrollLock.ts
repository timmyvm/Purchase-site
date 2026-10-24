"use client";

import { useEffect } from "react";

// Single owner of document.body.style.overflow. Overlays must acquire the
// lock here instead of touching body overflow directly: two overlays doing
// independent save/restore can re-apply a stale "hidden" after both close,
// freezing the page with nothing on screen. The body unlocks only when the
// last holder releases.

let lockCount = 0;

export const acquireScrollLock = (): (() => void) => {
  lockCount += 1;
  document.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) document.body.style.overflow = "";
  };
};

export const isScrollLocked = () => lockCount > 0;

export const useScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    return acquireScrollLock();
  }, [active]);
};
