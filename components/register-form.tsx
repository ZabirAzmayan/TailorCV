"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function onSubmit(formData: FormData) {
    setPending(true); setError(undefined);
    const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setPending(false); setError(body.error ?? "Could not create your account."); return; }
    const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirect: false, callbackUrl: "/dashboard" });
    setPending(false);
    if (result?.error) { setError("Your account is ready. Please sign in."); return; }
    window.location.assign(result?.url ?? "/dashboard");
  }
  return <form action={onSubmit} className="space-y-4"><label className="block text-sm font-medium">Name<Input className="mt-1.5" name="name" autoComplete="name" required /></label><label className="block text-sm font-medium">Email<Input className="mt-1.5" name="email" type="email" autoComplete="email" required /></label><label className="block text-sm font-medium">Password <span className="font-normal text-slate-400">(12+ characters)</span><Input className="mt-1.5" name="password" type="password" autoComplete="new-password" minLength={12} required /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button className="w-full" disabled={pending}>{pending ? "Creating account…" : "Create account"}</Button><p className="text-center text-sm text-slate-500">Already registered? <Link href="/sign-in" className="font-semibold text-emerald-700">Sign in</Link></p></form>;
}
