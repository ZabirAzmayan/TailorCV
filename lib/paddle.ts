import { createHmac, timingSafeEqual } from "crypto";
import { ApiError } from "@/lib/api";

const PADDLE_API_BASE = "https://api.paddle.com";

export type PaddleTransaction = { id: string; checkout?: { url?: string } };

export async function createPaddleLifetimeTransaction(input: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = process.env.PADDLE_LIFETIME_PRICE_ID;
  if (!apiKey || !priceId) throw new ApiError("Billing is not configured.", 503);

  const response = await fetch(`${PADDLE_API_BASE}/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      customer: { email: input.email, name: input.name || undefined },
      custom_data: { userId: input.userId, product: "lifetime_access" },
    }),
    cache: "no-store",
  });
  const body = (await response.json()) as { data?: PaddleTransaction; error?: { detail?: string } };
  if (!response.ok || !body.data?.id) {
    console.error("Paddle transaction creation failed", body);
    throw new ApiError("We could not start secure checkout. Please try again.", 502);
  }
  return body.data;
}

function parseSignature(header: string) {
  const values = new Map<string, string[]>();
  for (const section of header.split(";")) {
    const [key, value] = section.trim().split("=", 2);
    if (key && value) values.set(key, [...(values.get(key) ?? []), value]);
  }
  return { timestamp: values.get("ts")?.[0], signatures: values.get("h1") ?? [] };
}

export function verifyPaddleSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  if (!secret || !signatureHeader) return false;
  const { timestamp, signatures } = parseSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;
  // Paddle SDKs use a five-second replay-protection tolerance by default.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 5) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}:${rawBody}`).digest("hex");
  return signatures.some((signature) => {
    if (signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  });
}
