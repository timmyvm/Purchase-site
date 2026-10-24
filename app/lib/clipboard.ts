"use client";

/**
 * Clipboard write with a legacy fallback. navigator.clipboard is unavailable
 * on insecure origins and in some in-app browsers (Instagram, Facebook) —
 * exactly where referral links get shared from — so the textarea+execCommand
 * path stays.
 */
export const copyToClipboard = async (value: string): Promise<boolean> => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the legacy fallback below.
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};
