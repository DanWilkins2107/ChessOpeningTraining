-- moves holds a MoveNode[] that movesSchema (web/src/elements/movesSchema/movesSchema.ts) loads. A later migration
-- that changes the shape validate_move_tree_moves checks must change that schema too.
create table public.move_trees (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  folder_id uuid,
  name text not null check (name = trim(name) and char_length(name) between 1 and 100),
  side text not null check (side in ('white', 'black')),
  moves jsonb not null default '[]',
  created_at timestamptz not null default now(),
  -- Keeps a move tree out of another user's folder. A null folder_id puts it at the top level.
  foreign key (folder_id, owner_id) references public.folders (id, owner_id) on delete cascade
);

create index move_trees_owner_id_idx on public.move_trees (owner_id);
create index move_trees_folder_id_idx on public.move_trees (folder_id);

grant select on table public.move_trees to authenticated;
create policy "Owners read their move trees" on public.move_trees
  for select to authenticated
  using (owner_id = (select auth.uid()));

grant insert (folder_id, name, side, moves) on table public.move_trees to authenticated;
create policy "Owners create their move trees" on public.move_trees
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

grant update (name, side, moves) on table public.move_trees to authenticated;
create policy "Owners update their move trees" on public.move_trees
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant delete on table public.move_trees to authenticated;
create policy "Owners delete their move trees" on public.move_trees
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create function public.enforce_move_trees_per_owner_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises inserts per owner, so concurrent ones cannot all pass the count.
  perform pg_advisory_xact_lock(hashtext('public.move_trees'), hashtext(new.owner_id::text));

  if (select count(*) from public.move_trees where owner_id = new.owner_id) >= 500 then
    raise exception 'A user can have at most 500 move trees'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_move_trees_per_owner_limit
  before insert on public.move_trees
  for each row execute function public.enforce_move_trees_per_owner_limit();

create function public.validate_move_tree_moves()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if jsonb_typeof(new.moves) <> 'array' or octet_length(new.moves::text) > 512 * 1024 then
    raise exception 'Moves must be an array of at most 512 KB'
      using errcode = 'check_violation';
  end if;

  -- A move at ply n is nested 2n - 1 levels deep. Checked first, so the checks below never recurse deeper.
  if jsonb_path_exists(new.moves, 'strict $.**{1201}') then
    raise exception 'A line can be at most 600 plies'
      using errcode = 'check_violation';
  end if;

  if jsonb_path_exists(new.moves, 'strict $.** ? (@.type() == "array")[*] ? (@.type() != "object")')
    -- A missing key is an error in strict mode, which makes the condition unknown rather than false.
    or jsonb_path_exists(new.moves, 'strict $.** ? (@.type() == "object")
      ? ((@.san.type() == "string" && @.children.type() == "array") is unknown
        || !(@.san.type() == "string" && @.children.type() == "array"))')
    or jsonb_array_length(jsonb_path_query_array(new.moves, 'strict $.** ? (@.type() == "object").*.type()'))
      <> 2 * jsonb_array_length(jsonb_path_query_array(new.moves, 'strict $.** ? (@.type() == "object").type()'))
  then
    raise exception 'Every move must be exactly a string san and a children array'
      using errcode = 'check_violation';
  end if;

  if jsonb_array_length(
    jsonb_path_query_array(new.moves, 'strict $.** ? (@.type() == "object" && @.children.size() == 0).san')
  ) > 1000 then
    raise exception 'Moves can have at most 1000 lines'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger validate_move_tree_moves
  before insert or update of moves on public.move_trees
  for each row execute function public.validate_move_tree_moves();
