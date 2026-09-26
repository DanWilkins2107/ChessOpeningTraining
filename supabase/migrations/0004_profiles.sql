create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  animate_pieces boolean not null default true
);

grant select on table public.profiles to authenticated;
create policy "Owners read their profile" on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

grant insert (animate_pieces) on table public.profiles to authenticated;
create policy "Owners create their profile" on public.profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

grant update (animate_pieces) on table public.profiles to authenticated;
create policy "Owners update their profile" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
