import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { CheckoutButton } from "@/components/checkout-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const benefits = ["Unlimited tailored resumes", "Unlimited cover letters", "ATS-friendly, structured documents", "PDF downloads and saved history", "Lifetime access — no subscription"];
export default async function PricingPage() {
  const session = await auth();
  return <><SiteHeader /><main className="mx-auto max-w-5xl px-5 py-16 text-center"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Simple, honest pricing</span><h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl">One payment. Your career toolkit for life.</h1><p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">Create factual, targeted applications without recurring charges.</p><section className="mx-auto mt-10 max-w-md rounded-2xl border-2 border-emerald-500 bg-white p-7 text-left shadow-xl"><div className="flex items-end justify-between"><h2 className="text-xl font-bold">Lifetime Access</h2><p><span className="text-4xl font-bold">$25</span><span className="text-sm text-slate-500"> USD once</span></p></div><ul className="my-7 space-y-3">{benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-sm"><Check className="mt-0.5 shrink-0 text-emerald-600" size={17}/>{benefit}</li>)}</ul>{session?.user ? <CheckoutButton /> : <Link href="/sign-in?callbackUrl=/pricing"><Button size="lg" className="w-full">Sign in to purchase</Button></Link>}<p className="mt-4 text-center text-xs text-slate-500">Secure checkout and tax handling by Paddle, our merchant of record.</p></section></main></>;
}
