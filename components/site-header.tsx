import Link from "next/link";
import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  return <header className="no-print border-b bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
    <Link href="/" className="flex items-center gap-2 font-bold text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white"><FileText size={17} /></span>TailorCV AI</Link>
    <nav className="flex items-center gap-2">{session?.user ? <Link href="/dashboard"><Button size="sm">Dashboard</Button></Link> : <><Link href="/pricing"><Button variant="ghost" size="sm">Pricing</Button></Link><Link href="/sign-in"><Button size="sm">Sign in</Button></Link></>}</nav>
  </div></header>;
}
