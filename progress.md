Original prompt: PLEASE IMPLEMENT THIS PLAN for scaveng.io as a mobile-first Next.js + Supabase alpha product.

- Repo was effectively empty in the worktree, with previously tracked static-dashboard files deleted by the user.
- Rebuild is being done greenfield with App Router and a mock-backed data layer that can later be swapped to real Supabase integrations.
- First chunk: scaffold package/config, typed domain model, mobile-first UI, and API surfaces.
- Second chunk: implemented App Router pages, mobile-first components, middleware-based guest/admin cookies, API route handlers, README, and a starter Supabase schema.
- Fixed TS namespace imports and added the missing admin submission review route with literal path handling.
- Switched from build-time font downloading to runtime CSS imports and fixed the remaining strict TypeScript error in the Supabase cookie adapter.
- Fixed the typed route complaint in the preview switcher by making the generated preview URL an explicit Next Route.
- Adjusted the Next config to use a custom dist directory and disable output file tracing after the Windows/OneDrive build hit a readlink error inside .next.

- Re-encoded the source tree to UTF-8 after Next build surfaced Windows text encoding issues from PowerShell file writes.
- Rewrote repo text files with explicit UTF-8 without BOM after webpack rejected the BOM-prefixed package.json.
- Cleaned local verification artifacts (dist-next and tsconfig.tsbuildinfo) and updated .gitignore accordingly.
- Began the real backend/auth slice: expanded identity/types, added Supabase capability detection, repository fallback switching, stronger validation, and a reusable magic-link account card.
- Added the Supabase-backed repository, real reminder persistence, magic-link callback handling, sign-in/sign-out APIs, and account surfaces on the history page.
- Wired the mobile upload client to send the image payload to the finalize API, added the post-submit account card, and created the missing auth API route directories.
- Fixed the live-repository type seam by extending the finalize input, clarifying a fallback username expression, and typing the Supabase route cookie callback.
- Tightened the finalize input so both mock and Supabase submission paths accept the same required image payload shape.
- Cleaned build artifacts again and updated README/schema for the service-role, storage bucket, magic-link auth, and reminder subscription tables.
- Added OpenAI and Resend helper modules for moderation, challenge suggestion generation, and reminder delivery.
- Extended both repository implementations with challenge suggestion generation and reminder-recipient listing, and upgraded Supabase finalization to use OpenAI moderation when available.
- Added admin suggestion generation and reminder cron routes, and upgraded the admin UI to trigger AI suggestions and review flagged submissions inline.
- Cleaned build artifacts again and updated README for the OpenAI moderation/suggestion path, Resend cron delivery, and the new env vars.
