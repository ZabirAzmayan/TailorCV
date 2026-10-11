import OpenAI from "openai";
import { ApiError } from "@/lib/api";

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ApiError("AI service is not configured.", 503);
  return new OpenAI({ apiKey });
}

export async function createStructuredDocument<T>({
  system, input, name, schema,
}: {
  system: string;
  input: string;
  name: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      temperature: 0.25,
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
      messages: [{ role: "system", content: system }, { role: "user", content: input }],
    });
    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("The AI response was empty.");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("OpenAI generation failed", error);
    throw new ApiError("We could not generate your document. Please try again.", 502);
  }
}
