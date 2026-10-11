import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "TailorCV AI", template: "%s | TailorCV AI" },
  description: "Truthful, ATS-ready resumes and tailored cover letters.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
