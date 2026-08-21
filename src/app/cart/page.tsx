"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore, cartTotal } from "@/lib/cart-store";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="px-[5%] py-20 text-center">
        <p className="text-muted mb-6">Your cart is empty.</p>
        <Link href="/" className="btn-neon px-6 py-3 text-xs uppercase tracking-wider">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="px-[5%] py-12 max-w-3xl mx-auto">
      <h1 className="font-display text-xl mb-8">Your Cart</h1>
      <div className="space-y-4 mb-10">
        {items.map((item) => (
          <div key={item.line_id} className="glass-card p-4 flex gap-4">
            <div className="relative w-20 h-20 shrink-0 bg-dark2 rounded overflow-hidden">
              {item.image_url && (
                <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-display text-sm">{item.product_name}</div>
              {item.selected_options.length > 0 && (
                <div className="text-xs text-muted mt-1">
                  {item.selected_options.map((o) => o.choice_label).join(" · ")}
                </div>
              )}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-glass-border rounded">
                  <button
                    className="px-2 py-0.5"
                    onClick={() => setQuantity(item.line_id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <button
                    className="px-2 py-0.5"
                    onClick={() => setQuantity(item.line_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-xs text-muted underline"
                  onClick={() => removeItem(item.line_id)}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-cyan font-display text-sm">
              ₱{(item.unit_price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <span className="text-muted">Subtotal</span>
        <span className="font-display text-lg text-cyan">₱{total.toFixed(2)}</span>
      </div>

      <Link
        href="/checkout"
        className="btn-neon block text-center px-6 py-3 text-xs uppercase tracking-wider"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
