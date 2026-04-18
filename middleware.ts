import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  console.log("AUTH HEADER 👉", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/api/items/:path*", "/api/orders/:path*"],
};