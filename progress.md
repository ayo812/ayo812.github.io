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
- Added shared admin-auth and EXIF verification helpers, and prepared the codebase for real metadata timing checks and Supabase-session admin gating.
- Replaced the secret-cookie admin gate with Supabase-session middleware checks and converted the admin unlock screen into a sign-in/allowlist flow.
- Swapped both submission finalization paths onto the shared EXIF timing verifier so missing or conflicting metadata routes to manual review and explicit stale EXIF timestamps reject.
- Rewrote the mock and Supabase finalize functions directly so they both use EXIF-driven verification rather than the previous client-timestamp-only check.
- Fixed Supabase submission row mapping so rejected moderation/verification states are not surfaced as accepted just because an accepted_at timestamp exists.
- Fixed stray literal newline markers left in repository import headers from an earlier patch.
- Replaced the invalid Supabase cookie type import with a local cookie-shape type and typed the middleware cookie callback explicitly.
- Cleaned build artifacts again and updated README to document EXIF freshness checks and the new SCAVENG_ADMIN_EMAILS-based admin access model.
- Expanded submission typing to carry structured verification and moderation artifacts, and extended the EXIF verifier to return machine-readable details instead of only a note string.
- Updated the mock repository to carry structured moderation/verification artifacts and to support a mock due-results publication path for the new cron behavior.
- Updated the Supabase repository to persist structured moderation/verification artifacts and to support scheduled due-result publication.
- Added Playwright-based smoke coverage for the mobile guest flow, guest history prompt, unauthenticated admin redirect, and results cron publication.
- Installed `@playwright/test`, added `playwright.config.ts`, stable build-backed `test:e2e` scripts, and a fixture upload image for mobile upload coverage.
- Switched the Playwright web server from `next dev` to built `next start` because dev-mode module reloads reset the in-memory mock repository between submission intent and finalize.
- Verified the E2E suite passes locally with `npm run test:e2e` after installing Chromium via `npx playwright install chromium`.
- TODO: add signed-in Supabase-path E2E coverage once a stable local auth/storage test environment exists.
- TODO: add admin review-path coverage for flagged submissions and a real storage-backed upload assertion when Supabase env vars are present.
- Reworked timing so the public product now treats results as immediate at submission close instead of leaving a one-hour public gap.
- Updated the home page to auto-refresh across the close boundary, expose a ranked result share card after `results-out`, and copy share text through Web Share or clipboard.
- Added shared result-summary helpers plus repository support for per-player overall rank and share text in both mock and Supabase paths.
- Updated the E2E suite to cover the immediate-results share flow and kept an internal `results-soon` state only for ops/cron smoke coverage.
- Replaced the old result-code direction with lazy official share links, a public `/result/[shareId]` page, and a private result-asset proxy so trust comes from the canonical scaveng.io URL instead of copied text alone.
- Added /api/results/share, /api/result-assets/[shareId], and /result/[shareId], plus repository support for lazy share-link creation and public verified result lookup.
- Updated the Supabase schema with shared_results, updated the home share card to create links on demand, and refreshed the E2E suite for stable verified share URLs and 404 handling on invalid result links.
- Added a test-only Web Share override flag so Playwright can force the clipboard branch while production browsers still prefer the native share sheet.
- Verified the immediate-results and verified-sharing implementation with 
pm run typecheck, 
pm run build, and 
pm run test:e2e.
- Added lib/site.ts for canonical base-URL resolution across localhost, Vercel preview, Vercel production, and explicit APP_BASE_URL deployments.
- Hardened /result/[shareId] metadata with canonical URLs, OG/Twitter unfurls based on the shared submission image, and 
oindex privacy defaults for result pages/assets.
- Added .env.example and ercel.json so Vercel env setup and cron registration are part of the repo instead of only README instructions.
