// JSON.stringify alone doesn't escape "<", so a "</script>" inside any string
// value would terminate the inline JSON-LD script tag. Escaping "<" as the
// < JSON escape keeps the output valid JSON and inert in HTML.
export const safeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replace(/</g, "\\u003c");
