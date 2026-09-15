-- move_tree holds a MoveTree from web/src/elements/moveTree.ts; if either shape changes, change the other.
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.studies on delete cascade,
  name text not null check (name = trim(name) and char_length(name) between 1 and 100),
  move_tree jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index chapters_study_id_idx on public.chapters (study_id);

grant select on table public.chapters to authenticated;
create policy "Study owners read their chapters" on public.chapters
  for select to authenticated
  using (study_id in (select id from public.studies where owner_id = (select auth.uid())));

grant insert (study_id, name, move_tree) on table public.chapters to authenticated;
create policy "Study owners create their chapters" on public.chapters
  for insert to authenticated
  with check (study_id in (select id from public.studies where owner_id = (select auth.uid())));

grant update (name, move_tree) on table public.chapters to authenticated;
create policy "Study owners update their chapters" on public.chapters
  for update to authenticated
  using (study_id in (select id from public.studies where owner_id = (select auth.uid())))
  with check (study_id in (select id from public.studies where owner_id = (select auth.uid())));

grant delete on table public.chapters to authenticated;
create policy "Study owners delete their chapters" on public.chapters
  for delete to authenticated
  using (study_id in (select id from public.studies where owner_id = (select auth.uid())));

create function public.enforce_chapters_per_study_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises inserts per study, so concurrent ones cannot all pass the count.
  perform pg_advisory_xact_lock(hashtext('public.chapters'), hashtext(new.study_id::text));

  if (select count(*) from public.chapters where study_id = new.study_id) >= 100 then
    raise exception 'A study can have at most 100 chapters'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_chapters_per_study_limit
  before insert on public.chapters
  for each row execute function public.enforce_chapters_per_study_limit();

create function public.validate_chapter_move_tree()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if jsonb_typeof(new.move_tree) <> 'array' or octet_length(new.move_tree::text) > 512 * 1024 then
    raise exception 'A move tree must be an array of at most 512 KB'
      using errcode = 'check_violation';
  end if;

  -- A move at ply n is nested 2n - 1 levels deep. Checked first, so the checks below never recurse deeper.
  if jsonb_path_exists(new.move_tree, 'strict $.**{1201}') then
    raise exception 'A move tree line can be at most 600 plies'
      using errcode = 'check_violation';
  end if;

  if jsonb_path_exists(new.move_tree, 'strict $.** ? (@.type() == "array")[*] ? (@.type() != "object")')
    -- A missing key is an error in strict mode, which makes the condition unknown rather than false.
    or jsonb_path_exists(new.move_tree, 'strict $.** ? (@.type() == "object")
      ? ((@.san.type() == "string" && @.children.type() == "array") is unknown
        || !(@.san.type() == "string" && @.children.type() == "array"))')
    or jsonb_array_length(jsonb_path_query_array(new.move_tree, 'strict $.** ? (@.type() == "object").*.type()'))
      <> 2 * jsonb_array_length(jsonb_path_query_array(new.move_tree, 'strict $.** ? (@.type() == "object").type()'))
  then
    raise exception 'Every move must be exactly a string san and a children array'
      using errcode = 'check_violation';
  end if;

  if jsonb_array_length(
    jsonb_path_query_array(new.move_tree, 'strict $.** ? (@.type() == "object" && @.children.size() == 0).san')
  ) > 1000 then
    raise exception 'A move tree can have at most 1000 lines'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger validate_chapter_move_tree
  before insert or update of move_tree on public.chapters
  for each row execute function public.validate_chapter_move_tree();
