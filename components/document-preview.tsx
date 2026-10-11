"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoverLetterDocument, ResumeDocument } from "@/types/documents";

type Props = { type: "RESUME" | "COVER_LETTER"; content: ResumeDocument | CoverLetterDocument; filename: string };
export function DocumentPreview({ type, content, filename }: Props) {
  const [downloading, setDownloading] = useState(false);
  async function downloadPdf() {
    const element = document.getElementById("document-preview");
    if (!element) return;
    setDownloading(true);
    try { const html2pdf = (await import("html2pdf.js")).default; await html2pdf().set({ margin: 8, filename: `${filename}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(element).save(); }
    finally { setDownloading(false); }
  }
  return <><div className="no-print mb-5 flex justify-end gap-2"><Button variant="outline" onClick={() => window.print()}><Printer size={16}/>Print</Button><Button onClick={downloadPdf} disabled={downloading}><Download size={16}/>{downloading ? "Preparing…" : "Download PDF"}</Button></div><article id="document-preview" className="print-document mx-auto max-w-[210mm] rounded-xl border bg-white p-7 shadow-sm sm:p-12">{type === "RESUME" ? <Resume content={content as ResumeDocument} /> : <CoverLetter content={content as CoverLetterDocument} />}</article></>;
}

function Resume({ content }: { content: ResumeDocument }) { return <div className="text-sm leading-relaxed text-slate-800"><header className="border-b-2 border-slate-900 pb-4"><h1 className="text-3xl font-bold tracking-tight text-slate-950">{content.contact.fullName}</h1><p className="mt-1 font-medium text-slate-600">{content.contact.headline}</p><p className="mt-2 text-xs text-slate-600">{[content.contact.email, content.contact.phone, content.contact.location, ...content.contact.links.map((link) => link.url)].filter(Boolean).join("  •  ")}</p></header><Section title="Professional summary"><p>{content.professionalSummary}</p></Section><Section title="Core skills"><p>{content.skills.join("  ·  ")}</p></Section><Section title="Experience">{content.experience.map((job, index) => <div key={`${job.company}-${index}`} className="mb-5 last:mb-0"><div className="flex flex-wrap justify-between gap-x-4"><p className="font-bold text-slate-950">{job.role}</p><p className="text-xs font-medium">{job.startDate} — {job.endDate}</p></div><p className="font-semibold">{job.company}</p><ul className="mt-1 list-disc space-y-1 pl-5">{job.bullets.map((bullet, bulletIndex) => <li key={bulletIndex}>{bullet}</li>)}</ul></div>)}</Section><Section title="Education">{content.education.map((item, index) => <div key={`${item.institution}-${index}`} className="mb-2 flex flex-wrap justify-between gap-x-4"><div><span className="font-bold text-slate-950">{item.degree}</span><span> · {item.institution}</span>{item.details && <span> · {item.details}</span>}</div><span className="text-xs">{item.startDate} — {item.endDate}</span></div>)}</Section>{content.certifications.length > 0 && <Section title="Certifications"><p>{content.certifications.join("  ·  ")}</p></Section>}</div>; }
function CoverLetter({ content }: { content: CoverLetterDocument }) { return <div className="whitespace-pre-line text-[15px] leading-7 text-slate-800"><p>{content.recipient}</p><p className="mt-8 font-semibold">{content.subject}</p><p className="mt-6">{content.greeting}</p>{content.paragraphs.map((paragraph, index) => <p key={index} className="mt-5">{paragraph}</p>)}<p className="mt-6">{content.closing}</p><p className="mt-6 font-semibold">{content.signature}</p></div>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6"><h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wider text-slate-950">{title}</h2>{children}</section>; }
