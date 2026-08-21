"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import type { Fulfillment } from "@/lib/types";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const total = cartTotal(items);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone,
          email: email || undefined,
          fulfillment,
          address: fulfillment === "delivery" ? address : undefined,
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            selected_option_choice_ids: i.selected_options.map((o) => o.choice_id),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-[5%] py-12 max-w-lg mx-auto">
      <h1 className="font-display text-xl mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1">
            Full Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded px-3 py-2 outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1">
            Phone
          </label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded px-3 py-2 outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded px-3 py-2 outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-2">
            Fulfillment
          </label>
          <div className="flex gap-2">
            {(["pickup", "delivery"] as Fulfillment[]).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFulfillment(f)}
                className={`px-4 py-2 rounded text-sm border capitalize ${
                  fulfillment === f
                    ? "border-cyan text-cyan bg-cyan/10"
                    : "border-glass-border text-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {fulfillment === "delivery" && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-1">
              Delivery Address
            </label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-glass border border-glass-border rounded px-3 py-2 outline-none focus:border-cyan h-20"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-glass-border">
          <span className="text-muted">Total</span>
          <span className="font-display text-lg text-cyan">₱{total.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-magenta">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-neon w-full py-3 text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {submitting ? "Redirecting to payment…" : "Pay with GCash / Maya / Card"}
        </button>
      </form>
    </div>
  );
}
