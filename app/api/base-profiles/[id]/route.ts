import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { baseProfileSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = baseProfileSchema.parse(await request.json());
    const owned = await prisma.baseProfile.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!owned) throw new ApiError("Profile not found.", 404);
    const profile = await prisma.$transaction(async (tx) => {
      if (input.isDefault) await tx.baseProfile.updateMany({ where: { userId: user.id, NOT: { id } }, data: { isDefault: false } });
      return tx.baseProfile.update({ where: { id }, data: input });
    });
    return NextResponse.json(profile);
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const result = await prisma.baseProfile.deleteMany({ where: { id, userId: user.id } });
    if (!result.count) throw new ApiError("Profile not found.", 404);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
}
