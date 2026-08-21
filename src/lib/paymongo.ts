import "server-only";
import crypto from "crypto";

const PAYMONGO_API = "https://api.paymongo.com/v1";

function authHeader() {
  const key = process.env.PAYMONGO_SECRET_KEY!;
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export type CheckoutLineItem = {
  name: string;
  quantity: number;
  amountCentavos: number; // per-unit price in centavos
  description?: string;
};

export async function createCheckoutSession(opts: {
  orderId: string;
  lineItems: CheckoutLineItem[];
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const res = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: opts.lineItems.map((li) => ({
            name: li.name,
            quantity: li.quantity,
            amount: li.amountCentavos,
            currency: "PHP",
            description: li.description,
          })),
          payment_method_types: ["gcash", "paymaya", "card"],
          description: `Order ${opts.orderId}`,
          reference_number: opts.orderId,
          billing: {
            name: opts.customerName,
            email: opts.customerEmail,
          },
          success_url: opts.successUrl,
          cancel_url: opts.cancelUrl,
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayMongo checkout session failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  return {
    id: json.data.id as string,
    checkoutUrl: json.data.attributes.checkout_url as string,
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts["t"];
  const signature = parts["te"] ?? parts["li"]; // test vs live signature key
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
