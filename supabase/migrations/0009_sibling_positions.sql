alter table public.folders add column position int check (position >= 0);
alter table public.move_trees add column position int check (position >= 0);

update public.folders
set position = numbered.position
from (
  select id, row_number() over (partition by owner_id, parent_id order by created_at, id) - 1 as position
  from public.folders
) as numbered
where folders.id = numbered.id;

update public.move_trees
set position = numbered.position
from (
  select id, row_number() over (partition by owner_id, folder_id order by created_at, id) - 1 as position
  from public.move_trees
) as numbered
where move_trees.id = numbered.id;

alter table public.folders alter column position set not null;
alter table public.move_trees alter column position set not null;

-- Deferred, so a reorder can pass through duplicates within one transaction. Each covers the index it replaces.
alter table public.folders
  add unique nulls not distinct (owner_id, parent_id, position) deferrable initially deferred;
alter table public.move_trees
  add unique nulls not distinct (owner_id, folder_id, position) deferrable initially deferred;
drop index public.folders_owner_id_parent_id_idx;
drop index public.move_trees_owner_id_folder_id_idx;

-- Moves go through the reorder RPC, which renumbers both the old and new siblings.
revoke update (parent_id) on table public.folders from authenticated;

create function public.append_folder_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises position changes among one owner's siblings in a folder (or the root), across folders and move
  -- trees. The reorder RPC must take this same key, after the per-owner lock, so the two cannot deadlock.
  perform pg_advisory_xact_lock(
    hashtextextended('siblings:' || new.owner_id || ':' || coalesce(new.parent_id::text, 'root'), 0)
  );

  select coalesce(max(position) + 1, 0) into new.position
  from public.folders
  where owner_id = new.owner_id and parent_id is not distinct from new.parent_id;

  return new;
end;
$$;

-- Named to fire after enforce_folders_per_owner_limit, which takes the per-owner lock.
create trigger set_folder_position
  before insert on public.folders
  for each row execute function public.append_folder_position();

create function public.append_move_tree_position()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serialises position changes among one owner's siblings in a folder (or the root), across folders and move
  -- trees. The reorder RPC must take this same key, after the per-owner lock, so the two cannot deadlock.
  perform pg_advisory_xact_lock(
    hashtextextended('siblings:' || new.owner_id || ':' || coalesce(new.folder_id::text, 'root'), 0)
  );

  select coalesce(max(position) + 1, 0) into new.position
  from public.move_trees
  where owner_id = new.owner_id and folder_id is not distinct from new.folder_id;

  return new;
end;
$$;

-- Named to fire after enforce_move_trees_per_owner_limit, which takes the per-owner lock.
create trigger set_move_tree_position
  before insert on public.move_trees
  for each row execute function public.append_move_tree_position();

-- Siblings come back in position order. The client groups rows by parent, so ordering the flat lists is enough.
create or replace function public.get_repertoire()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'folders', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'parent_id', parent_id) order by position, id
      )
      from public.folders
      where owner_id = (select auth.uid())
    ), '[]'),
    'move_trees', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'side', side, 'folder_id', folder_id) order by position, id
      )
      from public.move_trees
      where owner_id = (select auth.uid())
    ), '[]')
  );
$$;
