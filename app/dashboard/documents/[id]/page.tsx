import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { DocumentPreview } from "@/components/document-preview";
import type { CoverLetterDocument, ResumeDocument } from "@/types/documents";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user?.id) redirect("/sign-in");
  const { id } = await params;
  const [user, document] = await Promise.all([prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }), prisma.generatedDocument.findFirst({ where: { id, userId: session.user.id } })]);
  if (!document) notFound();
  return <DashboardShell name={user.name}><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{document.type === "RESUME" ? "Tailored CV" : "Cover letter"}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{document.title}</h1><p className="mt-1 text-slate-600">Generated {document.createdAt.toLocaleDateString()} · Review before sending.</p></div><DocumentPreview type={document.type} content={document.content as ResumeDocument | CoverLetterDocument} filename={document.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()} /></DashboardShell>;
}
