import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { GenerationForm } from "@/components/generation-form";
import { Button } from "@/components/ui/button";

export default async function GeneratePage() {
  const session = await auth(); if (!session?.user?.id) redirect("/sign-in");
  const [user, profiles] = await Promise.all([prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }), prisma.baseProfile.findMany({ where: { userId: session.user.id }, select: { id: true, label: true }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] })]);
  return <DashboardShell name={user.name}><div className="max-w-3xl"><h1 className="text-3xl font-bold tracking-tight">Create a tailored application</h1><p className="mt-1 text-slate-600">Your document will use only the evidence stored in your selected base profile.</p>{user.isPremium ? <div className="mt-8"><GenerationForm profiles={profiles} /></div> : <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-bold">Lifetime Access required</h2><p className="mt-1 text-sm text-amber-900">Unlimited generation is available after the one-time $25 purchase.</p><Link href="/pricing" className="mt-4 inline-block"><Button>View pricing</Button></Link></div>}</div></DashboardShell>;
}
