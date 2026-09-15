alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
-- Postgres grants EXECUTE on new functions to PUBLIC outside any schema default.
alter default privileges for role postgres
  revoke execute on functions from public;

create function public.enable_row_level_security()
returns event_trigger
language plpgsql
set search_path = ''
as $$
declare
  command record;
begin
  for command in
    select object_identity
    from pg_event_trigger_ddl_commands()
    where object_type in ('table', 'partitioned table')
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', command.object_identity);
  end loop;
end;
$$;

create event trigger enable_row_level_security
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.enable_row_level_security();
