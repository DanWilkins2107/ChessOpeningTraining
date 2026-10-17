create table public.training_days (
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  moves_trained integer not null default 0 check (moves_trained between 0 and 100000),
  primary key (owner_id, day)
);

grant select on table public.training_days to authenticated;
create policy "Owners read their training days" on public.training_days
  for select to authenticated
  using (owner_id = (select auth.uid()));

create function public.record_trained_moves(day date, moves integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if moves is null or moves not between 1 and 1000 then
    raise exception 'Moves per call must be between 1 and 1000'
      using errcode = 'check_violation';
  end if;

  -- The client sends its local date; every timezone is within a day of UTC.
  if record_trained_moves.day is null
    or record_trained_moves.day not between (now() at time zone 'utc')::date - 1
      and (now() at time zone 'utc')::date + 1 then
    raise exception 'Day must be within a day of today'
      using errcode = 'check_violation';
  end if;

  insert into public.training_days (owner_id, day, moves_trained)
  values ((select auth.uid()), record_trained_moves.day, moves)
  on conflict (owner_id, day) do update
    set moves_trained = training_days.moves_trained + excluded.moves_trained;
end;
$$;

grant execute on function public.record_trained_moves(date, integer) to authenticated;
