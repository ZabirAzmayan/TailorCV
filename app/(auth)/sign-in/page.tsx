import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  if (await auth()) redirect("/dashboard");
  const { callbackUrl } = await searchParams;
  return <><SiteHeader /><main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md place-items-center px-5"><Card className="w-full"><CardHeader><CardTitle className="text-2xl">Welcome back</CardTitle><p className="mt-1 text-sm text-slate-500">Sign in to continue building your next opportunity.</p></CardHeader><CardContent><SignInForm callbackUrl={callbackUrl} /></CardContent></Card></main></>;
}
