"use client";

import { useState } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutButton() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function checkout() {
    setPending(true); setError(undefined);
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not start checkout.");
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token) throw new Error("Payments are temporarily unavailable.");
      const paddle = await initializePaddle({ token, environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production" });
      if (!paddle) throw new Error("Could not load secure checkout.");
      paddle.Checkout.open({ transactionId: body.transactionId, settings: { displayMode: "overlay", theme: "light", locale: "en" } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start checkout."); }
    finally { setPending(false); }
  }
  return <div><Button size="lg" className="w-full" disabled={pending} onClick={checkout}>{pending && <LoaderCircle className="animate-spin" size={16}/>}Get lifetime access — $25</Button>{error && <p className="mt-3 text-center text-xs text-red-600">{error}</p>}</div>;
}
