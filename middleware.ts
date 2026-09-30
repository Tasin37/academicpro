import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { path: "/admin", role: "admin" },
  { path: "/student", role: "student" },
  { path: "/writer", role: "writer" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname === "/auth") {
    if (token?.role) {
      const destination = token.role === "admin" ? "/admin" : token.role === "writer" ? "/writer" : "/student";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  for (const route of protectedRoutes) {
    if (pathname === route.path || pathname.startsWith(`${route.path}/`)) {
      if (!token) {
        const signInUrl = new URL("/auth", request.url);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (token.role !== route.role) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }

      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/writer/:path*", "/auth"],
};
