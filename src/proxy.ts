import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// Optimistic check only: real verification happens in requireUser().
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip login, API routes (they check auth themselves), and static files.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
