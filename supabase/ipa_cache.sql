create table if not exists public.ipa_cache (
  word text primary key,
  ipa text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.ipa_cache enable row level security;

drop policy if exists "ipa_cache_read_authenticated" on public.ipa_cache;
create policy "ipa_cache_read_authenticated"
on public.ipa_cache
for select
to authenticated
using (true);

drop policy if exists "ipa_cache_no_client_write" on public.ipa_cache;
create policy "ipa_cache_no_client_write"
on public.ipa_cache
for all
to authenticated
using (false)
with check (false);
