-- Drop-alert signups. Separate from APL's subscribers table so neither
-- store's email flows can reach the other's list. Service role only.
create table public.sticker_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'site',
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
-- An expression index, so /api/subscribe inserts and treats a unique
-- violation (23505) as "already signed up" rather than upserting on email.
create unique index sticker_subscribers_email_key on public.sticker_subscribers (lower(email));
alter table public.sticker_subscribers enable row level security;
