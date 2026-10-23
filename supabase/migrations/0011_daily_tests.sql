-- No row = not started, null score = in progress, set score = done.
-- Owners write through RLS: a test touches only its own row, so a user can fake their own score.
create table public.daily_tests (
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  -- Each line's shape belongs to test line generation.
  lines jsonb not null check (
    case when jsonb_typeof(lines) = 'array'
      then jsonb_array_length(lines) between 1 and 10 and octet_length(lines::text) < 256 * 1024
      else false
    end
  ),
  line_index smallint not null default 0,
  move_index smallint not null default 0 check (move_index between 0 and 600),
  -- One outcome per question, grouped by line, so a resumed test can recompute its score.
  results jsonb not null default '[]' check (
    jsonb_typeof(results) = 'array' and octet_length(results::text) < 64 * 1024
  ),
  score smallint check (score between 0 and 100),
  primary key (owner_id, day),
  -- The case keeps a non-array lines failing the lines check rather than erroring here.
  check (
    case when jsonb_typeof(lines) = 'array'
      then line_index between 0 and jsonb_array_length(lines)
        and (score is null or line_index = jsonb_array_length(lines))
      else true
    end
  )
);

grant select on table public.daily_tests to authenticated;
create policy "Owners read their daily tests" on public.daily_tests
  for select to authenticated
  using (owner_id = (select auth.uid()));

grant insert (day, lines) on table public.daily_tests to authenticated;
create policy "Owners start a daily test within a day of today" on public.daily_tests
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and day between current_date - 1 and current_date + 1
  );

grant update (line_index, move_index, results, score) on table public.daily_tests to authenticated;
create policy "Owners progress their unfinished daily tests" on public.daily_tests
  for update to authenticated
  using (owner_id = (select auth.uid()) and score is null)
  with check (owner_id = (select auth.uid()));
