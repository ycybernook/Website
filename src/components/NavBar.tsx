"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

export default function NavBar() {
  const count = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-4 bg-gradient-to-b from-dark2/95 to-transparent backdrop-blur border-b border-glass-border">
      <Link
        href="/"
        className="font-display text-sm font-black tracking-widest text-cyan"
        style={{ textShadow: "0 0 20px var(--neon-cyan)" }}
      >
        YANYAN&apos;S <span className="text-magenta">CYBERNOOK</span>
      </Link>
      <Link
        href="/cart"
        className="btn-neon px-4 py-2 text-xs uppercase tracking-wider"
      >
        Cart{count > 0 ? ` (${count})` : ""}
      </Link>
    </nav>
  );
}
