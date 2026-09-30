import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "student" | "writer";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: "admin" | "student" | "writer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "student" | "writer";
  }
}
