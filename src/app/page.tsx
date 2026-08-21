import { createAnonSupabaseClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createAnonSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <div>
      <section className="px-[5%] py-20 text-center">
        <h1 className="font-display text-3xl md:text-5xl font-black tracking-wide mb-4">
          <span className="text-cyan" style={{ textShadow: "0 0 20px var(--neon-cyan)" }}>
            YANYAN&apos;S
          </span>{" "}
          <span className="text-magenta">CYBERNOOK</span>
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          ✦ Print, Pay, Watch, Play — with a mint of creativity ✦
        </p>
      </section>

      <section className="px-[5%] pb-20">
        <h2 className="font-display text-xs tracking-[3px] uppercase text-cyan mb-6">
          Shop
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {(products as Product[] | null)?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
