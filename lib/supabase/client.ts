import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

function getPublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

function getServiceConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export function hasPublicSupabaseConfig() {
  const config = getPublicConfig();
  return Boolean(config.url && config.anonKey);
}

export function hasServiceRoleSupabaseConfig() {
  const config = getServiceConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

export async function getServerSupabaseClient() {
  const config = getPublicConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const cookieStore = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {}
    }
  });
}

export function getBrowserSupabaseClient() {
  const config = getPublicConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  return createBrowserClient(config.url, config.anonKey);
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const config = getServiceConfig();
  if (!config.url || !config.serviceRoleKey) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createRouteHandlerSupabaseClient(request: NextRequest, response: NextResponse) {
  const config = getPublicConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      }
    }
  });
}