import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw new ApiError("An account with that email already exists.", 409);

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({ data: { name: input.name, email, passwordHash } });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
