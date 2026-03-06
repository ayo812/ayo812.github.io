create extension if not exists pgcrypto;

create table if not exists public.hunts (
  id uuid primary key default gen_random_uuid(),
  challenge text not null,
  challenge_hint text not null,
  approved_source text not null check (approved_source in ('manual', 'ai-suggested')),
  drop_at timestamptz not null,
  closes_at timestamptz not null,
  results_at timestamptz not null,
  status text not null check (status in ('scheduled', 'live', 'results_pending', 'results_published')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  username text not null unique,
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.hunts(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  guest_alias text not null,
  identity_key text not null,
  storage_path text,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  width integer not null default 0,
  height integer not null default 0,
  captured_at timestamptz,
  accepted_at timestamptz,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'flagged', 'blocked')),
  moderation_details jsonb,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'needs_manual_review', 'rejected')),
  verification_details jsonb,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (hunt_id, identity_key)
);

create table if not exists public.daily_results (
  id uuid primary key default gen_random_uuid(),
  hunt_id uuid not null references public.hunts(id) on delete cascade,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  rank integer not null check (rank between 1 and 5),
  published_at timestamptz not null default now(),
  unique (hunt_id, rank),
  unique (submission_id)
);

create table if not exists public.shared_results (
  id uuid primary key default gen_random_uuid(),
  share_id text not null unique,
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rationale text not null,
  source_model text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reminder_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  identity_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reminder_subscriptions_touch_updated_at on public.reminder_subscriptions;
create trigger reminder_subscriptions_touch_updated_at
before update on public.reminder_subscriptions
for each row execute function public.touch_updated_at();

alter table public.hunts enable row level security;
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.daily_results enable row level security;
alter table public.shared_results enable row level security;
alter table public.challenge_suggestions enable row level security;
alter table public.reminder_subscriptions enable row level security;