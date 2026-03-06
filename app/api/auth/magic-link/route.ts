import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { hasPublicSupabaseConfig } from "@/lib/supabase/client";
import { magicLinkSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!hasPublicSupabaseConfig()) {
    return NextResponse.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const body = magicLinkSchema.parse(await request.json());
  const origin = new URL(request.url).origin;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.auth.signInWithOtp({
    email: body.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(body.next || "/history")}`
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}