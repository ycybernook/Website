import Image from "next/image";
import { notFound } from "next/navigation";
import { createAnonSupabaseClient } from "@/lib/supabase/server";
import AddToCart from "@/components/AddToCart";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAnonSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, option_groups(*, option_choices(*))")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!product) notFound();

  const typed = product as unknown as Product;
  typed.option_groups = (typed.option_groups ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => ({
      ...g,
      option_choices: (g.option_choices ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }));

  return (
    <div className="px-[5%] py-12 grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
      <div className="relative aspect-square glass-card overflow-hidden">
        {typed.image_url && (
          <Image
            src={typed.image_url}
            alt={typed.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      <div>
        <h1 className="font-display text-xl mb-2">{typed.name}</h1>
        <p className="text-muted mb-6">{typed.description}</p>
        <AddToCart product={typed} />
      </div>
    </div>
  );
}
