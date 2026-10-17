create function public.get_repertoire()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'folders', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by created_at desc, id)
      from public.folders
      where owner_id = (select auth.uid()) and parent_id is null
    ), '[]'),
    'move_trees', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'side', side) order by created_at desc, id)
      from public.move_trees
      where owner_id = (select auth.uid()) and folder_id is null
    ), '[]')
  );
$$;

grant execute on function public.get_repertoire() to authenticated;
