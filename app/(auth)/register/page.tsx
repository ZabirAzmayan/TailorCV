import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  if (await auth()) redirect("/dashboard");
  return <><SiteHeader /><main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md place-items-center px-5"><Card className="w-full"><CardHeader><CardTitle className="text-2xl">Build your next application</CardTitle><p className="mt-1 text-sm text-slate-500">Create an account to save your career profile.</p></CardHeader><CardContent><RegisterForm /></CardContent></Card></main></>;
}
