import { NextResponse, type NextRequest } from "next/server";

import { GUEST_COOKIE } from "@/lib/identity";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(GUEST_COOKIE)?.value) {
    response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/unlock") {
    const hasAdminCookie = request.cookies.get("scaveng_admin")?.value === "1";
    if (!hasAdminCookie) {
      return NextResponse.redirect(new URL("/admin/unlock", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

