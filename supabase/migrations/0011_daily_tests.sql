create table public.daily_tests (
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  lines jsonb not null check (
    case when jsonb_typeof(lines) = 'array'
      then jsonb_array_length(lines) = 10 and octet_length(lines::text) < 256 * 1024
      else false
    end
  ),
  line_index smallint not null default 0 check (line_index between 0 and 10),
  move_index smallint not null default 0 check (move_index between 0 and 600),
  results jsonb not null default '[]' check (
    jsonb_typeof(results) = 'array' and octet_length(results::text) < 64 * 1024
  ),
  score smallint check (score between 0 and 100),
  primary key (owner_id, day),
  check (score is null or line_index = 10)
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
