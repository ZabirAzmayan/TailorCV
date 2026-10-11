"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileOption = { id: string; label: string };
type Kind = "resume" | "cover";

export function GenerationForm({ profiles }: { profiles: ProfileOption[] }) {
  const [kind, setKind] = useState<Kind>("resume");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();
  const disabled = profiles.length === 0 || pending;
  async function submit(formData: FormData) {
    setPending(true); setError(undefined);
    const isResume = kind === "resume";
    const payload = {
      baseProfileId: formData.get("baseProfileId"),
      targetRole: formData.get("targetRole"),
      companyName: formData.get("companyName"),
      ...(isResume ? { jobDescription: formData.get("jobDescription") } : { companyContext: formData.get("companyContext"), jobDescription: formData.get("jobDescription") }),
    };
    try {
      const response = await fetch(isResume ? "/api/generate/resume" : "/api/generate/cover-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Generation failed.");
      router.push(`/dashboard/documents/${body.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Generation failed."); setPending(false); }
  }
  return <div className="rounded-xl border bg-white shadow-sm"><div className="flex border-b"><button type="button" onClick={() => setKind("resume")} className={`flex-1 px-4 py-4 text-sm font-semibold ${kind === "resume" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`}>Tailored CV</button><button type="button" onClick={() => setKind("cover")} className={`flex-1 px-4 py-4 text-sm font-semibold ${kind === "cover" ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-500"}`}>Cover letter</button></div><form action={submit} className="space-y-5 p-5 sm:p-7"><label className="block text-sm font-medium">Base profile<select name="baseProfileId" className="mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-sm" disabled={disabled} defaultValue={profiles[0]?.id}>{profiles.length ? profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.label}</option>) : <option>No base profile available</option>}</select></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Target role<Input className="mt-1.5" name="targetRole" required disabled={disabled} placeholder="e.g. Product Manager" /></label><label className="block text-sm font-medium">Company name {kind === "cover" && <span className="text-red-600">*</span>}<Input className="mt-1.5" name="companyName" required={kind === "cover"} disabled={disabled} placeholder="e.g. Acme Inc." /></label></div>{kind === "cover" && <label className="block text-sm font-medium">Company context <span className="font-normal text-slate-400">(optional)</span><Textarea className="mt-1.5" name="companyContext" disabled={disabled} placeholder="Mission, culture, industry, a recent launch, or other context you want reflected." /></label>}<label className="block text-sm font-medium">Job description {kind === "resume" && <span className="text-red-600">*</span>}<Textarea className="mt-1.5 min-h-56" name="jobDescription" required={kind === "resume"} disabled={disabled} placeholder="Paste the role requirements and responsibilities here." /></label>{!profiles.length && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Create a base profile first so TailorCV can write from your real experience.</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button size="lg" disabled={disabled} className="w-full"><Sparkles size={17}/>{pending ? "Writing your document…" : `Generate ${kind === "resume" ? "tailored CV" : "cover letter"}`}</Button><p className="text-center text-xs text-slate-500">TailorCV rewrites only from your base profile. Review every document before applying.</p></form></div>;
}
