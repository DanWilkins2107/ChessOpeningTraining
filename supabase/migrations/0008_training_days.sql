-- Written only by the train-moves edge function (service role); owners read.
create table public.training_days (
  owner_id uuid not null references auth.users on delete cascade,
  day date not null,
  moves_trained integer not null default 0 check (moves_trained between 0 and 100000),
  primary key (owner_id, day)
);

grant select on table public.training_days to authenticated;
create policy "Owners read their training days" on public.training_days
  for select to authenticated
  using (owner_id = (select auth.uid()));
