import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/paymongo";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paymongo-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = event?.data?.attributes?.type;

  if (type === "checkout_session.payment.paid") {
    const session = event.data.attributes.data;
    const sessionId = session.id;
    const supabase = createServiceSupabaseClient();

    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("paymongo_checkout_session_id", sessionId)
      .eq("status", "pending_payment");

    if (error) {
      console.error("Failed to mark order paid:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
