import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Sign in to continue.", 401);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new ApiError("Your account was not found.", 401);
  return user;
}

export async function requirePremiumUser() {
  const user = await requireUser();
  if (!user.isPremium || user.plan !== "LIFETIME_PREMIUM") {
    throw new ApiError("Lifetime Access is required to generate documents.", 403);
  }
  return user;
}
