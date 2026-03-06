# Scaveng.io

Mobile-first daily scavenger hunt alpha built with Next.js App Router. The app supports a real Supabase-backed path for auth, data, uploads, AI suggestion generation, AI moderation, and reminder delivery, while still falling back to an in-memory repository when backend environment is missing.

## What is implemented

- Mobile-first home flow for the four public game states: `waiting`, `live`, `submitted`, `results-out` (with an internal pending state still supported for ops/testing)
- Camera-first upload UX with client-side image compression and a real image payload sent to the finalize API
- One-submission-per-hunt locking through either Supabase or the demo repository
- EXIF-based freshness verification with manual-review fallback when metadata is missing or conflicting
- Contextual leaderboard CTA, ranked result share card, reminder card, `/leaderboard`, `/history`, protected `/admin`, and public `/result/[shareId]` routes
- Lazy creation of one official share link per submission, backed by the `shared_results` table and a canonical public result page
- Share-page metadata now uses canonical URLs plus the real submitted image for link unfurls; result pages and result assets are marked `noindex` for privacy
- Magic-link auth APIs and callback handling for passwordless sign-in
- Admin AI suggestion generation, flagged-submission review, and result publication
- OpenAI-backed image moderation during the real Supabase submission finalize path
- Structured moderation and EXIF verification audit fields stored on submissions in the Supabase schema
- Resend-backed morning reminder sender exposed through `/api/cron/reminders`
- Scheduled result publication route exposed through `/api/cron/results/publish`, with home-page fallback publication once the close time is reached
- Route handlers for hunt data, leaderboard data, auth, submission intent/finalize, verified result sharing, reminders, cron delivery, and admin operations

## Required environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=submissions
SCAVENG_ADMIN_EMAILS=admin@example.com,other-admin@example.com
OPENAI_API_KEY=
OPENAI_MODERATION_MODEL=gpt-4.1-mini
OPENAI_SUGGESTION_MODEL=gpt-4.1-mini
RESEND_API_KEY=
RESEND_FROM_EMAIL=
APP_BASE_URL=
CRON_SECRET=
```

`.env.example` includes the same keys for local setup.

If `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` are missing, the app falls back to the in-memory repository for core gameplay data.

If `OPENAI_API_KEY` is missing, admin suggestion generation falls back to canned suggestions and submission moderation falls back to basic mime/type checks.

If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is missing, `/api/cron/reminders` will skip delivery without crashing.

Admin access requires a valid Supabase session whose email is listed in `SCAVENG_ADMIN_EMAILS`, or a Supabase user with `app_metadata.role=admin` / `app_metadata.is_admin=true`.

## Setup

1. Install dependencies:
   ```powershell
   & 'C:\Program Files\nodejs\npm.cmd' install
   ```
2. Copy `.env.example` to `.env.local` and fill the values.
3. Apply [supabase/schema.sql](./supabase/schema.sql) to your Supabase project.
4. Create the storage bucket named by `SUPABASE_STORAGE_BUCKET`.
5. Start the app:
   ```powershell
   & 'C:\Program Files\nodejs\npm.cmd' run dev
   ```

## Vercel Deployment

1. Import the repo into Vercel.
2. Add every variable from `.env.example` to the Vercel project.
3. Set `APP_BASE_URL` to your canonical production URL, not the preview URL.
4. Connect your custom domain before relying on shared result links publicly.
5. Apply the Supabase schema and create the storage bucket before the first production deployment.
6. Keep [vercel.json](./vercel.json) committed so reminder and result-publication cron jobs are created automatically.

Notes:
- If `APP_BASE_URL` is unset, the app falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then localhost in development.
- The default reminder cron in [vercel.json](./vercel.json) runs at `12:00 UTC` and the result-publication reconciliation cron runs every 5 minutes.

## Cron

Trigger reminder delivery with:

```powershell
Invoke-WebRequest -Method POST -Uri 'http://localhost:3000/api/cron/reminders' -Headers @{ Authorization = 'Bearer YOUR_CRON_SECRET' }
```

Trigger due result publication with:

```powershell
Invoke-WebRequest -Method POST -Uri 'http://localhost:3000/api/cron/results/publish' -Headers @{ Authorization = 'Bearer YOUR_CRON_SECRET' }
```

If `CRON_SECRET` is unset, the cron routes accept unauthenticated local requests.

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`

On a fresh machine, install the Playwright browser once with:

```powershell
& 'C:\Program Files\nodejs\npx.cmd' playwright install chromium
```

## Notes

- The real repository uses the Supabase service role on the server to query hunts, submissions, results, shared result links, challenge suggestions, and reminder recipients.
- Guest identity is created in middleware and stored in a cookie.
- Public results appear as soon as the submission hour ends; the home page refreshes into `results-out` at the boundary and the repository publishes due results if they are not materialized yet.
- Verified sharing is link-based for v1: copied text is lightweight, and authenticity comes from the official `/result/[shareId]` page on the app domain.
- Shared result pages are opt-in and stable per submission; the uploaded image is visible only after a share link has been created.
- Development preview states still work even when Supabase is configured; those routes intentionally keep the mock path for state forcing.