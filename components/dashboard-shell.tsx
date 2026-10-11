import Link from "next/link";
import { FilePenLine, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { signOut } from "@/lib/auth";

const links = [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }, { href: "/dashboard/generate", label: "Create", icon: Sparkles }, { href: "/dashboard/profile", label: "Base profiles", icon: FilePenLine }];
export function DashboardShell({ children, name }: { children: React.ReactNode; name?: string | null }) {
  return <div className="min-h-screen bg-slate-50"><aside className="no-print fixed inset-y-0 hidden w-64 border-r bg-white p-5 md:block"><Link href="/dashboard" className="mb-10 block text-xl font-bold text-ink">TailorCV <span className="text-emerald-600">AI</span></Link><nav className="space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><Icon size={18}/>{label}</Link>)}</nav><form className="absolute bottom-5 left-5"><button formAction={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="text-sm font-medium text-slate-500 hover:text-slate-900">Sign out</button></form></aside><main className="md:pl-64"><header className="no-print flex h-16 items-center justify-between border-b bg-white px-5"><span className="font-semibold md:hidden">TailorCV AI</span><span className="ml-auto text-sm text-slate-500">{name}</span></header><div className="mx-auto max-w-6xl p-5 md:p-8">{children}</div></main></div>;
}
