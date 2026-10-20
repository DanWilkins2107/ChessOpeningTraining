-- Moves a folder to position (clamped) among parent_id's folders, or the root's when null. Both the old and new
-- siblings are renumbered from 0, which also closes gaps left by deletes.
create function public.move_folder(id uuid, parent_id uuid, "position" int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner uuid := auth.uid();
  old_parent_id uuid;
  sibling_key text;
begin
  -- The same per-owner lock as the insert and nesting triggers, so it is always taken first.
  perform pg_advisory_xact_lock(hashtext('public.folders'), hashtext(owner::text));

  select f.parent_id into old_parent_id
  from public.folders as f
  where f.id = move_folder.id and f.owner_id = owner;

  if not found or (
    move_folder.parent_id is not null
    and not exists (select from public.folders as f where f.id = move_folder.parent_id and f.owner_id = owner)
  ) then
    raise exception 'Not found' using errcode = 'no_data_found';
  end if;

  -- The insert triggers' sibling key, in sorted order so two moves cannot deadlock.
  for sibling_key in
    select distinct key
    from unnest(array[old_parent_id::text, move_folder.parent_id::text]) as parent,
      lateral (select 'siblings:' || owner || ':' || coalesce(parent, 'root')) as keys (key)
    order by key
  loop
    perform pg_advisory_xact_lock(hashtextextended(sibling_key, 0));
  end loop;

  -- Runs validate_folder_nesting.
  update public.folders as f
  set parent_id = move_folder.parent_id
  where f.id = move_folder.id;

  update public.folders as f
  set "position" = numbered.position
  from (
    select ranked.id, row_number() over (
      partition by ranked.parent_id order by ranked.sort_key, ranked.id = move_folder.id desc
    ) - 1 as "position"
    from (
      select s.id, s.parent_id,
        case when s.id = move_folder.id then move_folder.position
          else row_number() over (partition by s.parent_id, s.id = move_folder.id order by s.position, s.id) - 1
        end as sort_key
      from public.folders as s
      where s.owner_id = owner
        and (s.parent_id is not distinct from old_parent_id or s.parent_id is not distinct from move_folder.parent_id)
    ) as ranked
  ) as numbered
  where f.id = numbered.id;
end;
$$;

grant execute on function public.move_folder(uuid, uuid, int) to authenticated;

-- Moves a move tree to position (clamped) among folder_id's move trees, or the top level's when null. Both the old
-- and new siblings are renumbered from 0, which also closes gaps left by deletes.
create function public.move_move_tree(id uuid, folder_id uuid, "position" int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner uuid := auth.uid();
  old_folder_id uuid;
  sibling_key text;
begin
  -- The same per-owner lock as the insert trigger, so it is always taken first.
  perform pg_advisory_xact_lock(hashtext('public.move_trees'), hashtext(owner::text));

  select t.folder_id into old_folder_id
  from public.move_trees as t
  where t.id = move_move_tree.id and t.owner_id = owner;

  if not found or (
    move_move_tree.folder_id is not null
    and not exists (select from public.folders as f where f.id = move_move_tree.folder_id and f.owner_id = owner)
  ) then
    raise exception 'Not found' using errcode = 'no_data_found';
  end if;

  -- The insert triggers' sibling key, in sorted order so two moves cannot deadlock.
  for sibling_key in
    select distinct key
    from unnest(array[old_folder_id::text, move_move_tree.folder_id::text]) as parent,
      lateral (select 'siblings:' || owner || ':' || coalesce(parent, 'root')) as keys (key)
    order by key
  loop
    perform pg_advisory_xact_lock(hashtextextended(sibling_key, 0));
  end loop;

  update public.move_trees as t
  set folder_id = move_move_tree.folder_id
  where t.id = move_move_tree.id;

  update public.move_trees as t
  set "position" = numbered.position
  from (
    select ranked.id, row_number() over (
      partition by ranked.folder_id order by ranked.sort_key, ranked.id = move_move_tree.id desc
    ) - 1 as "position"
    from (
      select s.id, s.folder_id,
        case when s.id = move_move_tree.id then move_move_tree.position
          else row_number() over (partition by s.folder_id, s.id = move_move_tree.id order by s.position, s.id) - 1
        end as sort_key
      from public.move_trees as s
      where s.owner_id = owner
        and (s.folder_id is not distinct from old_folder_id or s.folder_id is not distinct from move_move_tree.folder_id)
    ) as ranked
  ) as numbered
  where t.id = numbered.id;
end;
$$;

grant execute on function public.move_move_tree(uuid, uuid, int) to authenticated;
