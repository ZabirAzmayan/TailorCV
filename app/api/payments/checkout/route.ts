import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { createPaddleLifetimeTransaction } from "@/lib/paddle";

export async function POST() {
  try {
    const user = await requireUser();
    if (user.isPremium) throw new ApiError("Your account already has Lifetime Access.", 409);
    if (!user.email) throw new ApiError("An email address is required for checkout.", 422);

    const transaction = await createPaddleLifetimeTransaction({ userId: user.id, email: user.email, name: user.name });
    await prisma.paymentTransaction.upsert({
      where: { externalTransactionId: transaction.id },
      update: {},
      create: { userId: user.id, externalTransactionId: transaction.id, amountCents: 2500, currency: "USD" },
    });
    return NextResponse.json({ transactionId: transaction.id });
  } catch (error) { return errorResponse(error); }
}
