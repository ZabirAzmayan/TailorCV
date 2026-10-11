"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const exampleExperience = "Company | Role | Jan 2022 | Present\n- Improved a supported outcome by 20%\n- Collaborated with cross-functional teams";

function parseExperience(value: string) {
  return value.split(/\n\s*\n/).map((block) => {
    const [heading = "", ...lines] = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const [company = "", role = "", startDate = "", endDate = ""] = heading.split("|").map((part) => part.trim());
    return { company, role, startDate, endDate, achievements: lines.map((line) => line.replace(/^[•-]\s*/, "")).filter(Boolean) };
  }).filter((item) => item.company && item.role);
}

function parseEducation(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [institution = "", degree = "", startDate = "", endDate = ""] = line.split("|").map((part) => part.trim());
    return { institution, degree, startDate, endDate, details: "" };
  }).filter((item) => item.institution && item.degree);
}

export function BaseProfileForm() {
  const [pending, setPending] = useState(false); const [error, setError] = useState<string>(); const router = useRouter();
  async function submit(formData: FormData) {
    setPending(true); setError(undefined);
    const fullName = String(formData.get("fullName") ?? "");
    const payload = {
      label: formData.get("label"), isDefault: true,
      contact: { fullName, email: formData.get("email"), phone: formData.get("phone") || "", location: formData.get("location") || "", headline: formData.get("headline") || "" },
      summary: formData.get("summary") || "",
      skills: String(formData.get("skills") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      experience: parseExperience(String(formData.get("experience") ?? "")),
      education: parseEducation(String(formData.get("education") ?? "")),
      certifications: String(formData.get("certifications") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      links: [],
    };
    const response = await fetch("/api/base-profiles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) { setError(body.error ?? "Could not save your profile."); return; }
    router.push("/dashboard/generate"); router.refresh();
  }
  return <form action={submit} className="space-y-6"><section className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Profile label<Input className="mt-1.5" name="label" required placeholder="Primary profile" /></label><label className="text-sm font-medium">Full name<Input className="mt-1.5" name="fullName" required /></label><label className="text-sm font-medium">Email<Input className="mt-1.5" type="email" name="email" required /></label><label className="text-sm font-medium">Phone<Input className="mt-1.5" name="phone" /></label><label className="text-sm font-medium sm:col-span-2">Location<Input className="mt-1.5" name="location" placeholder="Dhaka, Bangladesh" /></label><label className="text-sm font-medium sm:col-span-2">Professional headline<Input className="mt-1.5" name="headline" placeholder="Product designer | B2B SaaS" /></label></section><label className="block text-sm font-medium">Career summary<Textarea className="mt-1.5" name="summary" placeholder="Your factual career focus, strengths, and scope." /></label><label className="block text-sm font-medium">Core skills <span className="font-normal text-slate-400">(comma-separated)</span><Textarea className="mt-1.5 min-h-20" name="skills" required placeholder="Figma, UX research, React, stakeholder management" /></label><label className="block text-sm font-medium">Experience <span className="font-normal text-slate-400">(blank line between roles)</span><Textarea className="mt-1.5 min-h-60 font-mono text-xs" name="experience" required placeholder={exampleExperience} /><span className="mt-1 block text-xs font-normal text-slate-500">Heading format: Company | Role | Start date | End date. Put each factual achievement on the lines below it.</span></label><label className="block text-sm font-medium">Education <span className="font-normal text-slate-400">(one per line)</span><Textarea className="mt-1.5 font-mono text-xs" name="education" placeholder="University of Dhaka | BSc in CSE | 2018 | 2022" /><span className="mt-1 block text-xs font-normal text-slate-500">Format: Institution | Degree | Start date | End date.</span></label><label className="block text-sm font-medium">Certifications <span className="font-normal text-slate-400">(comma-separated, optional)</span><Input className="mt-1.5" name="certifications" placeholder="Google UX Design Certificate, AWS CCP" /></label>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button disabled={pending} size="lg">{pending ? "Saving profile…" : "Save profile and continue"}</Button></form>;
}
