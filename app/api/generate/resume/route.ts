import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api";
import { requirePremiumUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { resumeRequestSchema } from "@/lib/validations";
import { createStructuredDocument, AI_MODEL } from "@/lib/openai";
import { RESUME_SYSTEM_PROMPT } from "@/lib/prompts";
import { resumeJsonSchema } from "@/lib/document-schemas";
import type { ResumeDocument } from "@/types/documents";

export async function POST(request: Request) {
  try {
    const user = await requirePremiumUser();
    const input = resumeRequestSchema.parse(await request.json());
    const profile = await prisma.baseProfile.findFirst({ where: { id: input.baseProfileId, userId: user.id } });
    if (!profile) throw new ApiError("Base profile not found.", 404);

    const content = await createStructuredDocument<ResumeDocument>({
      system: RESUME_SYSTEM_PROMPT,
      name: "tailored_resume",
      schema: resumeJsonSchema,
      input: JSON.stringify({
        candidateProfile: profile,
        target: { role: input.targetRole, company: input.companyName || undefined, jobDescription: input.jobDescription },
      }),
    });
    const document = await prisma.generatedDocument.create({
      data: {
        userId: user.id, baseProfileId: profile.id, type: "RESUME",
        title: `${input.targetRole} Resume`, targetRole: input.targetRole,
        companyName: input.companyName || null, jobDescription: input.jobDescription,
        content, model: AI_MODEL,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
