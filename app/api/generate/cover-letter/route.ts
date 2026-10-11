import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api";
import { requirePremiumUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { coverLetterRequestSchema } from "@/lib/validations";
import { createStructuredDocument, AI_MODEL } from "@/lib/openai";
import { COVER_LETTER_SYSTEM_PROMPT } from "@/lib/prompts";
import { coverLetterJsonSchema } from "@/lib/document-schemas";
import type { CoverLetterDocument } from "@/types/documents";

export async function POST(request: Request) {
  try {
    const user = await requirePremiumUser();
    const input = coverLetterRequestSchema.parse(await request.json());
    const profile = await prisma.baseProfile.findFirst({ where: { id: input.baseProfileId, userId: user.id } });
    if (!profile) throw new ApiError("Base profile not found.", 404);

    const content = await createStructuredDocument<CoverLetterDocument>({
      system: COVER_LETTER_SYSTEM_PROMPT,
      name: "tailored_cover_letter",
      schema: coverLetterJsonSchema,
      input: JSON.stringify({
        candidateProfile: profile,
        target: {
          role: input.targetRole, companyName: input.companyName,
          companyContext: input.companyContext || undefined,
          jobDescription: input.jobDescription || undefined,
        },
      }),
    });
    const document = await prisma.generatedDocument.create({
      data: {
        userId: user.id, baseProfileId: profile.id, type: "COVER_LETTER",
        title: `${input.companyName} Cover Letter`, targetRole: input.targetRole,
        companyName: input.companyName, jobDescription: input.jobDescription || null,
        content, model: AI_MODEL,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
