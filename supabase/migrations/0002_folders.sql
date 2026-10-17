create table public.folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  parent_id uuid check (parent_id <> id),
  name text not null check (name = trim(name) and char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  -- Target of move_trees' (folder_id, owner_id) and folders' (parent_id, owner_id) foreign keys.
  unique (id, owner_id),
  -- Keeps a folder out of another user's folder. A null parent_id puts it at the root.
  foreign key (parent_id, owner_id) references public.folders (id, owner_id) on delete cascade
);

create index folders_owner_id_parent_id_idx on public.folders (owner_id, parent_id);

grant select on table public.folders to authenticated;
create policy "Owners read their folders" on public.folders
  for select to authenticated
  using (owner_id = (select auth.uid()));

grant insert (parent_id, name) on table public.folders to authenticated;
create policy "Owners create their folders" on public.folders
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

grant update (parent_id, name) on table public.folders to authenticated;
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

create function public.validate_folder_nesting()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  ancestor_id uuid := new.parent_id;
  depth int;
begin
  -- Serialises moves per owner, so two concurrent ones cannot form a cycle between them.
  perform pg_advisory_xact_lock(hashtext('public.folders'), hashtext(new.owner_id::text));

  with recursive subtree (id, height) as (
    select new.id, 1
    union all
    select folders.id, subtree.height + 1
    from public.folders join subtree on folders.parent_id = subtree.id
  )
  select max(height) into depth from subtree;

  while ancestor_id is not null loop
    if ancestor_id = new.id then
      raise exception 'A folder cannot be inside itself'
        using errcode = 'check_violation';
    end if;

    depth := depth + 1;
    if depth > 10 then
      raise exception 'Folders can be nested at most 10 deep'
        using errcode = 'check_violation';
    end if;

    select parent_id into ancestor_id from public.folders where id = ancestor_id;
  end loop;

  return new;
end;
$$;

create trigger validate_folder_nesting
  before insert or update of parent_id on public.folders
  for each row execute function public.validate_folder_nesting();
