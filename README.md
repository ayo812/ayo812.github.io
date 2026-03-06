# Scaveng.io

Mobile-first daily scavenger hunt alpha built with Next.js App Router. The app now supports a real Supabase-backed path for auth, data, uploads, AI suggestion generation, AI moderation, and reminder delivery, while still falling back to an in-memory repository when backend environment is missing.

## What is implemented

- Mobile-first home flow for all five game states: `waiting`, `live`, `submitted`, `results-soon`, `results-out`
- Camera-first upload UX with client-side image compression and a real image payload sent to the finalize API
- One-submission-per-hunt locking through either Supabase or the demo repository
- Contextual leaderboard CTA, reminder card, `/leaderboard`, `/history`, and protected `/admin` routes
- Magic-link auth APIs and callback handling for passwordless sign-in
- Admin AI suggestion generation, flagged-submission review, and result publication
- OpenAI-backed image moderation during the real Supabase submission finalize path
- Resend-backed morning reminder sender exposed through `/api/cron/reminders`
- Route handlers for hunt data, leaderboard data, auth, submission intent/finalize, reminders, cron delivery, and admin operations

## Required environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=submissions
SCAVENG_ADMIN_SECRET=
OPENAI_API_KEY=
OPENAI_MODERATION_MODEL=gpt-4.1-mini
OPENAI_SUGGESTION_MODEL=gpt-4.1-mini
RESEND_API_KEY=
RESEND_FROM_EMAIL=
APP_BASE_URL=
CRON_SECRET=
```

If `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` are missing, the app falls back to the in-memory repository for core gameplay data.

If `OPENAI_API_KEY` is missing, admin suggestion generation falls back to canned suggestions and submission moderation falls back to basic mime/type checks.

If `RESEND_API_KEY` or `RESEND_FROM_EMAIL` is missing, `/api/cron/reminders` will skip delivery without crashing.

## Setup

1. Install dependencies:
   ```powershell
   & 'C:\Program Files\nodejs\npm.cmd' install
   ```
2. Apply [supabase/schema.sql](./supabase/schema.sql) to your Supabase project.
3. Create the storage bucket named by `SUPABASE_STORAGE_BUCKET`.
4. Start the app:
   ```powershell
   & 'C:\Program Files\nodejs\npm.cmd' run dev
   ```

## Cron

Trigger reminder delivery with:

```powershell
Invoke-WebRequest -Method POST -Uri 'http://localhost:3000/api/cron/reminders' -Headers @{ Authorization = 'Bearer YOUR_CRON_SECRET' }
```

If `CRON_SECRET` is unset, the cron route accepts unauthenticated local requests.

## Verification

- `npm run typecheck`
- `npm run build`

## Notes

- The real repository uses the Supabase service role on the server to query hunts, submissions, results, challenge suggestions, and reminder recipients.
- Guest identity is created in middleware and stored in a cookie.
- Admin protection uses a simple secret-backed cookie unlock flow for now.
- Development preview states still work even when Supabase is configured; those routes intentionally keep the mock path for state forcing.