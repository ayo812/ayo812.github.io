import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const secret = process.env.SCAVENG_ADMIN_SECRET;

  if (!secret || body.secret !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("scaveng_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8
  });
  return response;
}

