const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

type Searchable = { name: string; slug: string; finish?: string; shortDescription?: string };

export const matchesProductSearch = (product: Searchable, query: string) => {
  const q = normalize(query);
  if (!q) return false;
  const haystack = normalize(
    [product.name, product.slug, product.finish ?? "", product.shortDescription ?? ""].join(" ")
  );
  return q.split(" ").every((term) => haystack.includes(term));
};

export const findProductSearchExactMatch = <T extends Searchable>(products: T[], query: string) => {
  const q = normalize(query);
  return products.find((product) => normalize(product.name) === q || normalize(product.slug) === q) ?? null;
};
