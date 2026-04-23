import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  /* ✅ PUBLIC ROUTES (allowed without login) */
  if (pathname === "/login" || pathname === "/register") {
    // If already logged in → redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  /* ❌ PROTECTED ROUTES */
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

/* ✅ Apply to all pages */
export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};