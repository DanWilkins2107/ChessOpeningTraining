-- Returns the user's whole folder tree in one call, so expanding a folder needs no further fetch. The per-owner caps
-- (100 folders, 500 move trees) bound the result, and moves are left out so it stays small.
create function public.get_repertoire()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'folders', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'parent_id', parent_id) order by created_at desc, id
      )
      from public.folders
      where owner_id = (select auth.uid())
    ), '[]'),
    'move_trees', coalesce((
      select jsonb_agg(
        jsonb_build_object('id', id, 'name', name, 'side', side, 'folder_id', folder_id) order by created_at desc, id
      )
      from public.move_trees
      where owner_id = (select auth.uid())
    ), '[]')
  );
$$;

grant execute on function public.get_repertoire() to authenticated;
