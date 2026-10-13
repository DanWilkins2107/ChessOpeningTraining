alter table public.profiles
  add column show_move_hints boolean not null default true;

grant insert (show_move_hints) on table public.profiles to authenticated;
grant update (show_move_hints) on table public.profiles to authenticated;
