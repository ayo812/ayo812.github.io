import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Admin unlock now uses Supabase sign-in plus SCAVENG_ADMIN_EMAILS or app_metadata.role=admin." },
    { status: 410 }
  );
}