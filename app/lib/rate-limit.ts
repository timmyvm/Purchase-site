import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export const getClientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip")?.trim() ||
  "unknown";

/**
 * Fixed-window, per-instance limiter. Each route passes its OWN key, so a
 * busy page's other calls never eat an expensive route's allowance. It is
 * per serverless instance, so it slows abuse rather than guaranteeing a cap.
 */
export const rateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
};
