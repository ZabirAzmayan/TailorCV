import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseProfileForm } from "@/components/base-profile-form";

export default async function ProfilePage() {
  const session = await auth(); if (!session?.user?.id) redirect("/sign-in");
  const [user, profiles] = await Promise.all([prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }), prisma.baseProfile.findMany({ where: { userId: session.user.id }, select: { id: true, label: true, updatedAt: true } })]);
  return <DashboardShell name={user.name}><div className="max-w-3xl"><h1 className="text-3xl font-bold tracking-tight">Base profiles</h1><p className="mt-1 text-slate-600">The AI can only use facts you save here—keep them accurate and specific.</p>{profiles.length > 0 && <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">Saved profiles: {profiles.map((profile) => profile.label).join(", ")}. This starter ships with creating profiles; add the supplied PATCH endpoint to an edit drawer when you need in-place editing.</div>}<Card className="mt-8"><CardHeader><CardTitle>Create a base profile</CardTitle><p className="text-sm text-slate-500">Add one focused version of your professional background.</p></CardHeader><CardContent><BaseProfileForm /></CardContent></Card></div></DashboardShell>;
}
