import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createRouteHandlerSupabaseClient, getSupabaseAdminClient, hasPublicSupabaseConfig } from "@/lib/supabase/client";

function deriveUsername(email: string) {
  return email.split("@")[0].replace(/[^a-z0-9_]+/gi, "_").replace(/^_+|_+$/g, "") || "player";
}

async function ensureProfile(userId: string, email?: string | null) {
  const admin = getSupabaseAdminClient();
  if (!admin || !email) {
    return;
  }

  await admin.from("profiles").upsert({
    id: userId,
    email,
    username: deriveUsername(email),
    reminder_enabled: false
  }, { onConflict: "id" });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/history";

  if (!hasPublicSupabaseConfig()) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const response = NextResponse.redirect(new URL(next, url.origin));
  const supabase = createRouteHandlerSupabaseClient(request, response);
  if (!supabase) {
    return response;
  }

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (!result.error) {
      await ensureProfile(result.data.user?.id ?? "", result.data.user?.email);
      return response;
    }
  }

  if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!result.error) {
      await ensureProfile(result.data.user?.id ?? "", result.data.user?.email);
      return response;
    }
  }

  return NextResponse.redirect(new URL("/history?authError=1", url.origin));
}