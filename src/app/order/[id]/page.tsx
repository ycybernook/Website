import Link from "next/link";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import ClearCartOnPaid from "@/components/ClearCartOnPaid";
import PollUntilPaid from "@/components/PollUntilPaid";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) {
    return (
      <div className="px-[5%] py-20 text-center">
        <p className="text-muted">Order not found.</p>
      </div>
    );
  }

  const isPaid = order.status === "paid";

  return (
    <div className="px-[5%] py-20 max-w-lg mx-auto text-center">
      {isPaid && <ClearCartOnPaid />}
      {!isPaid && <PollUntilPaid />}
      <h1 className="font-display text-xl mb-4">
        {isPaid ? "✓ Order Confirmed" : "Payment Processing…"}
      </h1>
      <p className="text-muted mb-8">
        {isPaid
          ? `Thanks, ${order.customer_name}! We've received your order.`
          : "We're confirming your payment. This page will update once it's done — you can also check back in a moment."}
      </p>

      <div className="glass-card p-5 text-left mb-8">
        <div className="text-xs text-muted mb-3">Order #{order.id.slice(0, 8)}</div>
        {order.order_items.map((item: { id: string; product_name_snapshot: string; quantity: number; line_total: number }) => (
          <div key={item.id} className="flex justify-between text-sm mb-2">
            <span>
              {item.product_name_snapshot} × {item.quantity}
            </span>
            <span>₱{Number(item.line_total).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-display text-cyan pt-3 mt-3 border-t border-glass-border">
          <span>Total</span>
          <span>₱{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <Link href="/" className="btn-neon inline-block px-6 py-3 text-xs uppercase tracking-wider">
        Back to Shop
      </Link>
    </div>
  );
}
