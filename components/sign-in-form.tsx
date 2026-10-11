"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function onSubmit(formData: FormData) {
    setPending(true); setError(undefined);
    const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false, callbackUrl });
    setPending(false);
    if (result?.error) { setError("Incorrect email or password."); return; }
    window.location.assign(result?.url ?? callbackUrl);
  }
  return <form action={onSubmit} className="space-y-4"><label className="block text-sm font-medium">Email<Input className="mt-1.5" name="email" type="email" autoComplete="email" required /></label><label className="block text-sm font-medium">Password<Input className="mt-1.5" name="password" type="password" autoComplete="current-password" required /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button><div className="relative py-2 text-center text-xs text-slate-400 before:absolute before:inset-x-0 before:top-1/2 before:border-t before:content-['']"><span className="relative bg-white px-2">or</span></div><Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl })}>Continue with Google</Button><p className="text-center text-sm text-slate-500">New here? <Link href="/register" className="font-semibold text-emerald-700">Create an account</Link></p></form>;
}
