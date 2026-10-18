-- Called only by the train-moves edge function (supabase/functions/train-moves/index.ts), which takes user_id from
-- the verified JWT. Moving either means updating the other's reference.
create function public.train_moves(
  user_id uuid,
  tree_ids uuid[],
  path text[],
  confidence_changes integer[],
  day date
)
returns uuid[]
language plpgsql
set search_path = ''
as $$
declare
  tree record;
  tree_count integer;
  sides text[];
  trained_moves jsonb;
  siblings jsonb;
  move_path text[];
  move_index integer;
  ply integer;
  max_confidence integer;
  skipped_tree_ids uuid[] := '{}';
begin
  if user_id is null
    or coalesce(cardinality(tree_ids), 0) not between 1 and 500
    or array_position(tree_ids, null) is not null then
    raise exception 'Between 1 and 500 move trees are required'
      using errcode = 'check_violation';
  end if;

  if coalesce(cardinality(path), 0) not between 1 and 600 or array_position(path, null) is not null then
    raise exception 'The path must be between 1 and 600 moves'
      using errcode = 'check_violation';
  end if;

  if cardinality(confidence_changes) is distinct from cardinality(path)
    or exists (select from unnest(confidence_changes) as change where change is null or change not between -5 and 5) then
    raise exception 'Every move on the path needs a confidence change between -5 and 5'
      using errcode = 'check_violation';
  end if;

  -- The client sends its local date; every timezone is within a day of UTC.
  if train_moves.day is null
    or train_moves.day not between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1 then
    raise exception 'Day must be within a day of today'
      using errcode = 'check_violation';
  end if;

  -- Locked in id order, so concurrent calls over overlapping trees cannot deadlock.
  select count(*), array_agg(distinct locked.side) into tree_count, sides
  from (
    select move_trees.side
    from public.move_trees
    where move_trees.id = any (tree_ids) and move_trees.owner_id = train_moves.user_id
    order by move_trees.id
    for update
  ) as locked;

  if tree_count <> (select count(distinct tree_id) from unnest(tree_ids) as tree_id) then
    raise exception 'Move trees not found'
      using errcode = 'insufficient_privilege';
  end if;

  -- Which plies are the user's depends on the side, so one path cannot train both.
  if cardinality(sides) <> 1 then
    raise exception 'Move trees must all be for the same side'
      using errcode = 'check_violation';
  end if;

  for tree in
    select move_trees.id, move_trees.side, move_trees.moves
    from public.move_trees
    where move_trees.id = any (tree_ids)
  loop
    trained_moves := tree.moves;
    siblings := tree.moves;
    move_path := '{}';

    for ply in 1 .. cardinality(path) loop
      select element.ordinality - 1 into move_index
      from jsonb_array_elements(siblings) with ordinality as element (node, ordinality)
      where element.node ->> 'san' = path[ply];

      exit when move_index is null;

      move_path := move_path || move_index::text;
      -- The user plays odd plies with white and even plies with black.
      max_confidence := case when (ply % 2 = 1) = (tree.side = 'white') then 5 else 2 end;
      trained_moves := jsonb_set(
        trained_moves,
        move_path || 'confidence'::text,
        to_jsonb(greatest(0, least(max_confidence,
          coalesce((trained_moves #>> (move_path || 'confidence'::text))::integer, 0) + confidence_changes[ply])))
      );
      siblings := siblings -> move_index -> 'children';
      move_path := move_path || 'children'::text;
    end loop;

    if move_index is null then
      skipped_tree_ids := skipped_tree_ids || tree.id;
    else
      update public.move_trees set moves = trained_moves where move_trees.id = tree.id;
    end if;
  end loop;

  insert into public.training_days (owner_id, day, moves_trained)
  values (
    train_moves.user_id,
    train_moves.day,
    case when sides[1] = 'white' then (cardinality(path) + 1) / 2 else cardinality(path) / 2 end
  )
  on conflict on constraint training_days_pkey do update
    set moves_trained = training_days.moves_trained + excluded.moves_trained;

  return skipped_tree_ids;
end;
$$;

grant execute on function public.train_moves(uuid, uuid[], text[], integer[], date) to service_role;
