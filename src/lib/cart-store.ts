"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "line_id">) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, line_id: crypto.randomUUID() },
          ],
        })),
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.line_id !== lineId),
        })),
      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.line_id === lineId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "cybernook-cart" }
  )
);

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
}
