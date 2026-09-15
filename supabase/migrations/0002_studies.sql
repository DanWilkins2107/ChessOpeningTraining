create table public.studies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (name = trim(name) and char_length(name) between 1 and 100),
  side text not null check (side in ('white', 'black')),
  created_at timestamptz not null default now()
);

create index studies_owner_id_idx on public.studies (owner_id);

grant select, delete on table public.studies to authenticated;
grant insert (name, side), update (name, side) on table public.studies to authenticated;

create policy "Owners read their studies" on public.studies
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners create their studies" on public.studies
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners update their studies" on public.studies
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners delete their studies" on public.studies
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create function public.enforce_studies_per_owner_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises inserts per owner, so concurrent ones cannot all pass the count.
  perform pg_advisory_xact_lock(hashtext('public.studies'), hashtext(new.owner_id::text));

  if (select count(*) from public.studies where owner_id = new.owner_id) >= 100 then
    raise exception 'A user can have at most 100 studies'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_studies_per_owner_limit
  before insert on public.studies
  for each row execute function public.enforce_studies_per_owner_limit();
