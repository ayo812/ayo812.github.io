import { cookies } from "next/headers";

import { getServerSupabaseClient, hasPublicSupabaseConfig } from "@/lib/supabase/client";
import { type PlayerIdentity } from "@/lib/types";

export const GUEST_COOKIE = "scaveng_guest";

function createGuestAlias(seed: string): string {
  const adjectives = ["swift", "bright", "lucky", "keen", "wild", "daily"];
  const nouns = ["snapper", "tracker", "scout", "hunter", "finder", "spotter"];
  const chars = Array.from(seed.replace(/[^a-z0-9]/gi, "").toLowerCase());
  const score = chars.reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `${adjectives[score % adjectives.length]}_${nouns[score % nouns.length]}_${String(score % 97).padStart(2, "0")}`;
}

function deriveDisplayName(email: string, username?: string | null) {
  if (username && username.trim()) {
    return username;
  }

  const localPart = email.split("@")[0] ?? "player";
  return localPart.replace(/[^a-z0-9_]+/gi, "_").replace(/^_+|_+$/g, "") || "player";
}

export async function getIdentity(): Promise<PlayerIdentity> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  const guestId = existing ?? crypto.randomUUID();

  if (hasPublicSupabaseConfig()) {
    const supabase = await getServerSupabaseClient();
    const { data: authData } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    const user = authData.user;

    if (user?.email) {
      const { data: profile } = (await supabase
        ?.from("profiles")
        .select("username, reminder_enabled")
        .eq("id", user.id)
        .maybeSingle()) ?? { data: null };

      const username = profile?.username ?? undefined;
      return {
        id: user.id,
        guestAlias: createGuestAlias(user.id),
        isGuest: false,
        canSignIn: true,
        email: user.email,
        username,
        displayName: deriveDisplayName(user.email, username)
      };
    }
  }

  return {
    id: guestId,
    guestAlias: createGuestAlias(guestId),
    isGuest: true,
    canSignIn: hasPublicSupabaseConfig(),
    displayName: createGuestAlias(guestId)
  };
}

export function deriveGuestAlias(identityId: string): string {
  return createGuestAlias(identityId);
}