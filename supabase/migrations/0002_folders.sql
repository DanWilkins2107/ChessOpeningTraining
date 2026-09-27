create table public.folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null check (name = trim(name) and char_length(name) between 1 and 100),
  side text not null check (side in ('white', 'black')),
  created_at timestamptz not null default now()
);

create index folders_owner_id_idx on public.folders (owner_id);

grant select on table public.folders to authenticated;
create policy "Owners read their folders" on public.folders
  for select to authenticated
  using (owner_id = (select auth.uid()));

grant insert (name, side) on table public.folders to authenticated;
create policy "Owners create their folders" on public.folders
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

grant update (name, side) on table public.folders to authenticated;
create policy "Owners update their folders" on public.folders
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant delete on table public.folders to authenticated;
create policy "Owners delete their folders" on public.folders
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create function public.enforce_folders_per_owner_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises inserts per owner, so concurrent ones cannot all pass the count.
  perform pg_advisory_xact_lock(hashtext('public.folders'), hashtext(new.owner_id::text));

  if (select count(*) from public.folders where owner_id = new.owner_id) >= 100 then
    raise exception 'A user can have at most 100 folders'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_folders_per_owner_limit
  before insert on public.folders
  for each row execute function public.enforce_folders_per_owner_limit();
