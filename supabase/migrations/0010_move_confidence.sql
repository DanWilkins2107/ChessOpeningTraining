-- Replaces 0003's validate_move_tree_moves to allow an optional confidence per move. movesSchema
-- (web/src/elements/movesSchema/movesSchema.ts) mirrors this check; change both together.
create or replace function public.validate_move_tree_moves()
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
    or jsonb_path_exists(new.moves, 'strict $.** ? (@.type() == "object").keyvalue()
      ? (@.key != "san" && @.key != "children" && @.key != "confidence")')
    or jsonb_path_exists(new.moves, 'strict $.** ? (@.type() == "object" && exists(@.confidence)).confidence
      ? ((@.type() == "number" && @.floor() == @ && @ >= 0 && @ <= 5) is unknown
        || !(@.type() == "number" && @.floor() == @ && @ >= 0 && @ <= 5))')
  then
    raise exception 'Every move must be a string san, a children array and an optional whole-number confidence from 0 to 5'
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
