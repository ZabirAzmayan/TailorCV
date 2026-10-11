import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration used by middleware. Keep database and password code in auth.ts.
export const authConfig = {
  pages: { signIn: "/sign-in" },
  providers: [],
} satisfies NextAuthConfig;
