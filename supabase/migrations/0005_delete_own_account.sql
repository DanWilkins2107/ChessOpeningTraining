create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- A stolen session alone must not be enough: the caller has to have entered
  -- their password in the last 5 minutes.
  if not exists (
    select 1
    from jsonb_array_elements(auth.jwt() -> 'amr') as entry
    where entry ->> 'method' = 'password'
      and (entry ->> 'timestamp')::bigint >= extract(epoch from now()) - 300
  ) then
    raise exception 'Confirm your password to delete your account'
      using errcode = 'insufficient_privilege';
  end if;

  delete from auth.users where id = (select auth.uid());
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
