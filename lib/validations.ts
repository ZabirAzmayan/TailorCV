import { z } from "zod";

const safeText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const registerSchema = z.object({
  name: safeText("Name", 100),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(12, "Use at least 12 characters.").max(128),
});

export const baseProfileSchema = z.object({
  label: safeText("Profile name", 80),
  contact: z.object({
    fullName: safeText("Full name", 120),
    email: z.string().email(),
    phone: z.string().trim().max(50).optional().default(""),
    location: z.string().trim().max(120).optional().default(""),
    headline: z.string().trim().max(180).optional().default(""),
  }),
  summary: z.string().trim().max(2000).optional().default(""),
  education: z.array(z.object({
    institution: z.string().trim().max(180),
    degree: z.string().trim().max(180),
    startDate: z.string().trim().max(30).optional().default(""),
    endDate: z.string().trim().max(30).optional().default(""),
    details: z.string().trim().max(1000).optional().default(""),
  })).max(20),
  experience: z.array(z.object({
    company: z.string().trim().max(180),
    role: z.string().trim().max(180),
    startDate: z.string().trim().max(30).optional().default(""),
    endDate: z.string().trim().max(30).optional().default(""),
    achievements: z.array(z.string().trim().max(500)).max(20),
  })).max(30),
  skills: z.array(z.string().trim().min(1).max(80)).max(100),
  certifications: z.array(z.string().trim().max(180)).max(30).optional().default([]),
  links: z.array(z.object({
    label: z.string().trim().max(50),
    url: z.string().trim().url().max(500),
  })).max(10).optional().default([]),
  isDefault: z.boolean().optional().default(false),
});

export const resumeRequestSchema = z.object({
  baseProfileId: z.string().cuid(),
  targetRole: safeText("Target role", 160),
  jobDescription: safeText("Job description", 24000),
  companyName: z.string().trim().max(180).optional().default(""),
});

export const coverLetterRequestSchema = z.object({
  baseProfileId: z.string().cuid(),
  targetRole: safeText("Target role", 160),
  companyName: safeText("Company name", 180),
  companyContext: z.string().trim().max(6000).optional().default(""),
  jobDescription: z.string().trim().max(24000).optional().default(""),
});
