import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { baseProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireUser();
    const profiles = await prisma.baseProfile.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] });
    return NextResponse.json(profiles);
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = baseProfileSchema.parse(await request.json());
    const profile = await prisma.$transaction(async (tx) => {
      if (input.isDefault) await tx.baseProfile.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.baseProfile.create({ data: { ...input, userId: user.id } });
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
