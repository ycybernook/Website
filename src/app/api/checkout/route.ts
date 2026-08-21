import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/paymongo";

type CheckoutRequestItem = {
  product_id: string;
  quantity: number;
  selected_option_choice_ids: string[];
};

type CheckoutRequestBody = {
  customer_name: string;
  phone: string;
  email?: string;
  fulfillment: "pickup" | "delivery";
  address?: string;
  items: CheckoutRequestItem[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CheckoutRequestBody;

  if (!body.customer_name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }
  if (!body.items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (body.fulfillment === "delivery" && !body.address?.trim()) {
    return NextResponse.json({ error: "Address is required for delivery" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  // Recompute every price server-side from the DB — never trust client totals.
  const productIds = [...new Set(body.items.map((i) => i.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*, option_groups(*, option_choices(*))")
    .in("id", productIds)
    .eq("active", true);

  if (productsError || !products) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }

  const productsById = new Map(products.map((p) => [p.id, p]));

  type ResolvedItem = {
    product_id: string;
    product_name_snapshot: string;
    quantity: number;
    selected_options: {
      group_id: string;
      group_name: string;
      choice_id: string;
      choice_label: string;
      price_delta: number;
    }[];
    unit_price: number;
    line_total: number;
  };

  const resolvedItems: ResolvedItem[] = [];

  for (const reqItem of body.items) {
    const product = productsById.get(reqItem.product_id);
    if (!product || reqItem.quantity < 1) {
      return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 });
    }

    let unitPrice = Number(product.base_price);
    const selectedOptions: ResolvedItem["selected_options"] = [];

    for (const group of product.option_groups ?? []) {
      const chosenChoiceId = reqItem.selected_option_choice_ids.find((cid: string) =>
        group.option_choices.some((c: { id: string }) => c.id === cid)
      );
      if (group.required && !chosenChoiceId) {
        return NextResponse.json(
          { error: `Missing required option "${group.name}" for ${product.name}` },
          { status: 400 }
        );
      }
      if (chosenChoiceId) {
        const choice = group.option_choices.find(
          (c: { id: string }) => c.id === chosenChoiceId
        );
        if (choice) {
          unitPrice += Number(choice.price_delta);
          selectedOptions.push({
            group_id: group.id,
            group_name: group.name,
            choice_id: choice.id,
            choice_label: choice.label,
            price_delta: Number(choice.price_delta),
          });
        }
      }
    }

    resolvedItems.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      quantity: reqItem.quantity,
      selected_options: selectedOptions,
      unit_price: unitPrice,
      line_total: unitPrice * reqItem.quantity,
    });
  }

  const subtotal = resolvedItems.reduce((s, i) => s + i.line_total, 0);
  const total = subtotal; // delivery fee TBD — flat 0 for now

  if (total <= 0) {
    return NextResponse.json(
      { error: "Product prices are not set up yet — checkout is temporarily unavailable." },
      { status: 400 }
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customer_name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      fulfillment: body.fulfillment,
      address: body.address?.trim() || null,
      status: "pending_payment",
      subtotal,
      total,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    resolvedItems.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name_snapshot: i.product_name_snapshot,
      quantity: i.quantity,
      selected_options: i.selected_options,
      unit_price: i.unit_price,
      line_total: i.line_total,
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
  }

  const origin = req.nextUrl.origin;

  try {
    const session = await createCheckoutSession({
      orderId: order.id,
      customerName: body.customer_name.trim(),
      customerEmail: body.email?.trim(),
      lineItems: resolvedItems.map((i) => ({
        name: i.product_name_snapshot,
        quantity: i.quantity,
        amountCentavos: Math.round(i.unit_price * 100),
        description: i.selected_options.map((o) => o.choice_label).join(", "),
      })),
      successUrl: `${origin}/order/${order.id}?status=success`,
      cancelUrl: `${origin}/checkout?order=${order.id}&status=cancelled`,
    });

    await supabase
      .from("orders")
      .update({ paymongo_checkout_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ checkout_url: session.checkoutUrl, order_id: order.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to start payment. Please try again." },
      { status: 502 }
    );
  }
}
