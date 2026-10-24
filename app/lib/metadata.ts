// The primary production origin. Set NEXT_PUBLIC_SITE_URL in Vercel to the
// domain Vercel serves as primary; previews fall back to their own URL.
export const getBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
};
