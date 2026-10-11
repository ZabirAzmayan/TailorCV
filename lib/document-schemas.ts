// Strict schemas allow GPT-4o Structured Outputs to return a reliable document contract.
export const resumeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["contact", "professionalSummary", "skills", "experience", "education", "certifications"],
  properties: {
    contact: {
      type: "object", additionalProperties: false,
      required: ["fullName", "email", "phone", "location", "headline", "links"],
      properties: {
        fullName: { type: "string" }, email: { type: "string" }, phone: { type: "string" },
        location: { type: "string" }, headline: { type: "string" },
        links: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "url"], properties: { label: { type: "string" }, url: { type: "string" } } } },
      },
    },
    professionalSummary: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    experience: { type: "array", items: { type: "object", additionalProperties: false, required: ["company", "role", "startDate", "endDate", "bullets"], properties: { company: { type: "string" }, role: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
    education: { type: "array", items: { type: "object", additionalProperties: false, required: ["institution", "degree", "startDate", "endDate", "details"], properties: { institution: { type: "string" }, degree: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, details: { type: "string" } } } },
    certifications: { type: "array", items: { type: "string" } },
  },
} as const;

export const coverLetterJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["recipient", "subject", "greeting", "paragraphs", "closing", "signature"],
  properties: {
    recipient: { type: "string" }, subject: { type: "string" }, greeting: { type: "string" },
    paragraphs: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } },
    closing: { type: "string" }, signature: { type: "string" },
  },
} as const;
