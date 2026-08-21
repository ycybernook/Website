"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export default function ClearCartOnPaid() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
