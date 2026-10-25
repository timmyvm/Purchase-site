import type { Product } from "@/app/lib/types";
import { ProductCard } from "@/app/components/products/ProductCard";

type ProductGridProps = {
  products: Product[];
  className?: string;
  gridClassName?: string;
  itemClassName?: string;
};

export const ProductGrid = ({
  products,
  className = "",
  gridClassName = "grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  itemClassName = "min-w-0",
}: ProductGridProps) => (
  <div className={className}>
    <div className={gridClassName}>
      {products.map((product) => (
        <div key={product.id} className={itemClassName}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </div>
);
