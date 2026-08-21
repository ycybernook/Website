"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import type { Product, SelectedOption } from "@/lib/types";

export default function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [choices, setChoices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of product.option_groups) {
      if (g.kind === "select" && g.option_choices[0]) {
        initial[g.id] = g.option_choices[0].id;
      }
    }
    return initial;
  });
  const [added, setAdded] = useState(false);

  const selectedOptions: SelectedOption[] = useMemo(() => {
    return product.option_groups
      .filter((g) => g.kind === "select" && choices[g.id])
      .map((g) => {
        const choice = g.option_choices.find((c) => c.id === choices[g.id])!;
        return {
          group_id: g.id,
          group_name: g.name,
          choice_id: choice.id,
          choice_label: choice.label,
          price_delta: choice.price_delta,
        };
      });
  }, [product.option_groups, choices]);

  const unitPrice =
    product.base_price + selectedOptions.reduce((s, o) => s + o.price_delta, 0);

  function handleAdd() {
    addItem({
      product_id: product.id,
      product_name: product.name,
      image_url: product.image_url,
      unit_price: unitPrice,
      quantity,
      selected_options: selectedOptions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-6">
      {product.option_groups.map((group) => (
        <div key={group.id}>
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">
            {group.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {group.option_choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() =>
                  setChoices((c) => ({ ...c, [group.id]: choice.id }))
                }
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  choices[group.id] === choice.id
                    ? "border-cyan text-cyan bg-cyan/10"
                    : "border-glass-border text-muted"
                }`}
              >
                {choice.label}
                {choice.price_delta !== 0 &&
                  ` (${choice.price_delta > 0 ? "+" : ""}₱${choice.price_delta})`}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-muted">
          Qty
        </label>
        <div className="flex items-center border border-glass-border rounded">
          <button
            type="button"
            className="px-3 py-1"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="px-3">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="font-display text-lg text-cyan">
        ₱{(unitPrice * quantity).toFixed(2)}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="btn-neon px-6 py-3 text-xs uppercase tracking-wider"
        >
          {added ? "✓ Added" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          className="px-6 py-3 text-xs uppercase tracking-wider border border-glass-border rounded"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
