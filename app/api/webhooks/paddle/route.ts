import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPaddleSignature } from "@/lib/paddle";

type PaddleEvent = {
  event_id: string;
  event_type: "transaction.paid" | "transaction.completed" | "transaction.payment_failed" | string;
  occurred_at: string;
  data: {
    id: string;
    status: string;
    customer_id?: string | null;
    custom_data?: { userId?: string; product?: string } | null;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyPaddleSignature(rawBody, request.headers.get("paddle-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as PaddleEvent;
    const isLifetimePurchase = event.data.custom_data?.product === "lifetime_access";
    const eventStatus: PaymentStatus | null = event.event_type === "transaction.paid"
      ? "PAID"
      : event.event_type === "transaction.completed"
        ? "COMPLETED"
        : event.event_type === "transaction.payment_failed"
          ? "FAILED"
          : null;

    if (!eventStatus || !isLifetimePurchase) return NextResponse.json({ received: true });

    const payment = await prisma.paymentTransaction.findUnique({
      where: { externalTransactionId: event.data.id },
      select: { id: true, userId: true },
    });
    // Never trust arbitrary custom data alone: checkout must have created our pending transaction first.
    if (!payment) {
      return NextResponse.json({ received: true });
    }
    const alreadyProcessed = await prisma.paddleWebhookEvent.findUnique({ where: { externalEventId: event.event_id }, select: { id: true } });
    if (alreadyProcessed) return NextResponse.json({ received: true });

    await prisma.$transaction([
      prisma.paddleWebhookEvent.create({
        data: { externalEventId: event.event_id, eventType: event.event_type, paymentTransactionId: payment.id, payload: event },
      }),
      prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: eventStatus, rawPayload: event,
          paidAt: eventStatus === "FAILED" ? null : new Date(event.occurred_at),
        },
      }),
      ...(eventStatus === "PAID" || eventStatus === "COMPLETED"
        ? [prisma.user.update({
            where: { id: payment.userId },
            data: { isPremium: true, plan: "LIFETIME_PREMIUM", paddleCustomerId: event.data.customer_id ?? undefined },
          })]
        : []),
    ]);
    return NextResponse.json({ received: true });
  } catch (error) {
    // Non-2xx intentionally tells Paddle to retry a transient database failure.
    console.error("Paddle webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
