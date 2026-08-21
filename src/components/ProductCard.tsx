import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="glass-card overflow-hidden block transition-all hover:-translate-y-2 hover:border-cyan/40"
    >
      <div className="relative aspect-square bg-dark2">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="font-display text-xs tracking-wide mb-1">
          {product.name}
        </div>
        <div className="text-xs text-muted mb-2">{product.description}</div>
        <div className="text-cyan font-display text-sm">
          {product.base_price > 0
            ? `₱${product.base_price.toFixed(2)}`
            : "See options"}
        </div>
      </div>
    </Link>
  );
}
