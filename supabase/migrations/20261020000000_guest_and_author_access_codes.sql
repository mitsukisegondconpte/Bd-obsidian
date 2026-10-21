-- Codes d'accès à usage unique pour les comptes invités et les auteurs BD.
-- Le code brut ne quitte jamais le formulaire d'inscription; seule son
-- empreinte SHA-256 est conservée dans cette table.

alter table public.profiles
  add column if not exists is_guest boolean not null default false,
  add column if not exists lecture_author_code_pending boolean not null default false;

create table if not exists public.signup_access_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash bytea not null unique,
  code_type text not null check (code_type in ('guest', 'lecture_author')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  consumed_by uuid,
  revoked_at timestamptz
);

alter table public.signup_access_codes
  add column if not exists revoked_at timestamptz;

create index if not exists idx_signup_access_codes_expiry
  on public.signup_access_codes (expires_at);

alter table public.signup_access_codes enable row level security;
revoke all on public.signup_access_codes from anon, authenticated;

create or replace function public.issue_signup_access_code(
  p_code_type text,
  p_valid_days integer default 7
)
returns table (access_code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = extensions, pg_catalog, public
as $function$
declare
  v_code text;
  v_expires_at timestamptz;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_platform_admin
  ) then
    raise exception 'not authorized';
  end if;

  if p_code_type is null or p_code_type not in ('guest', 'lecture_author') then
    raise exception 'invalid access code type';
  end if;

  if p_valid_days is null or p_valid_days < 1 or p_valid_days > 90 then
    raise exception 'validity must be between 1 and 90 days';
  end if;

  v_code := encode(gen_random_bytes(24), 'hex');
  v_expires_at := now() + make_interval(days => p_valid_days);

  insert into public.signup_access_codes (code_hash, code_type, created_by, expires_at)
  values (digest(v_code, 'sha256'), p_code_type, auth.uid(), v_expires_at);

  return query select v_code, v_expires_at;
end;
$function$;

revoke all on function public.issue_signup_access_code(text, integer) from public, anon;
grant execute on function public.issue_signup_access_code(text, integer) to authenticated;

create or replace function public.list_signup_access_codes()
returns table (
  id uuid,
  code_type text,
  created_at timestamptz,
  expires_at timestamptz,
  consumed_at timestamptz,
  revoked_at timestamptz
)
language plpgsql
security definer
set search_path = extensions, pg_catalog, public
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_platform_admin
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select c.id, c.code_type, c.created_at, c.expires_at, c.consumed_at, c.revoked_at
  from public.signup_access_codes c
  order by c.created_at desc
  limit 100;
end;
$function$;

revoke all on function public.list_signup_access_codes() from public, anon;
grant execute on function public.list_signup_access_codes() to authenticated;

create or replace function public.revoke_signup_access_code(p_code_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_platform_admin
  ) then
    raise exception 'not authorized';
  end if;

  update public.signup_access_codes
  set revoked_at = now()
  where id = p_code_id
    and consumed_at is null
    and revoked_at is null;

  return found;
end;
$function$;

revoke all on function public.revoke_signup_access_code(uuid) from public, anon;
grant execute on function public.revoke_signup_access_code(uuid) to authenticated;

-- Le code est validé et consommé dans la transaction de création Auth.
-- L'UPDATE conditionnel rend l'usage unique même en cas d'inscriptions
-- simultanées; les métadonnées de validation ne peuvent pas être fournies
-- directement par le client.
create or replace function public.validate_signup_access_code()
returns trigger
language plpgsql
security definer
set search_path = extensions, pg_catalog, public
as $function$
declare
  v_guest_code text;
  v_author_code text;
  v_code_id uuid;
  v_metadata jsonb;
begin
  v_guest_code := nullif(btrim(new.raw_user_meta_data ->> 'guest_invitation_code'), '');
  v_author_code := nullif(btrim(new.raw_user_meta_data ->> 'lecture_author_code'), '');

  if v_guest_code is not null and v_author_code is not null then
    raise exception 'only one access code may be used per signup';
  end if;

  v_metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb)
    - 'guest_invitation_code'
    - 'lecture_author_code'
    - 'validated_guest_code'
    - 'validated_lecture_author_code'
    - 'is_guest'
    - 'is_lecture_author'
    - 'lecture_author_code_pending';

  if v_guest_code is not null then
    update public.signup_access_codes
    set consumed_at = clock_timestamp(), consumed_by = new.id
    where code_hash = digest(v_guest_code, 'sha256')
      and code_type = 'guest'
      and consumed_at is null
      and revoked_at is null
      and expires_at > clock_timestamp()
    returning id into v_code_id;

    if v_code_id is null then
      raise exception 'invitation code is invalid, expired, or already used';
    end if;

    v_metadata := jsonb_set(v_metadata, '{validated_guest_code}', 'true'::jsonb, true);
  elsif v_author_code is not null then
    update public.signup_access_codes
    set consumed_at = clock_timestamp(), consumed_by = new.id
    where code_hash = digest(v_author_code, 'sha256')
      and code_type = 'lecture_author'
      and consumed_at is null
      and revoked_at is null
      and expires_at > clock_timestamp()
    returning id into v_code_id;

    if v_code_id is null then
      raise exception 'author code is invalid, expired, or already used';
    end if;

    v_metadata := jsonb_set(v_metadata, '{validated_lecture_author_code}', 'true'::jsonb, true);
  end if;

  new.raw_user_meta_data := v_metadata;
  return new;
end;
$function$;

revoke all on function public.validate_signup_access_code() from public, anon, authenticated;

drop trigger if exists validate_signup_access_code_before_insert on auth.users;
create trigger validate_signup_access_code_before_insert
  before insert on auth.users
  for each row execute function public.validate_signup_access_code();

-- Le code auteur n'active que le compte créé par son porteur. Pour les
-- inscriptions avec vérification d'email, l'accès est activé après confirmation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  base_username text := coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1));
  final_username text := base_username;
  suffix int := 0;
  v_author_code_valid boolean := coalesce(
    new.raw_user_meta_data ->> 'validated_lecture_author_code' = 'true',
    false
  );
begin
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (
    id, username, display_name, avatar_url, author_source,
    is_guest, is_lecture_author, lecture_author_code_pending
  )
  values (
    new.id,
    final_username,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'author_source',
    coalesce(new.raw_user_meta_data ->> 'validated_guest_code' = 'true', false),
    v_author_code_valid and new.email_confirmed_at is not null,
    v_author_code_valid and new.email_confirmed_at is null
  );
  return new;
end;
$function$;

-- Ces fonctions d'attribution sont réservées aux déclencheurs et aux RPC
-- serveur: les exécuter directement ne doit pas permettre de fabriquer des
-- badges ou d'appeler les gestionnaires de compte.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.award_first_publish_badge() from public, anon, authenticated;
revoke all on function public.award_collector_badges(uuid) from public, anon, authenticated;

create or replace function public.activate_pending_lecture_author()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles
    set is_lecture_author = true,
        lecture_author_code_pending = false,
        updated_at = now()
    where id = new.id
      and lecture_author_code_pending = true;
  end if;
  return new;
end;
$function$;

revoke all on function public.activate_pending_lecture_author() from public, anon, authenticated;

drop trigger if exists activate_pending_lecture_author_after_confirmation on auth.users;
create trigger activate_pending_lecture_author_after_confirmation
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.activate_pending_lecture_author();

-- Les colonnes de rôle restent gérées par les RPC existantes; l'accès invité
-- n'est accordé que par le trigger de création ci-dessus.
create policy "guests cannot create comments"
  on public.comments as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot create likes"
  on public.likes as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot create reading lists"
  on public.reading_lists as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot add reading list items"
  on public.reading_list_items as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot publish works"
  on public.works as restrictive for all to authenticated
  using (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ))
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot publish work chapters"
  on public.work_chapters as restrictive for all to authenticated
  using (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ))
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

create policy "guests cannot react to community posts"
  on public.community_post_reactions as restrictive for insert to authenticated
  with check (not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_guest
  ));

-- Les invités ne peuvent suivre un auteur; les abonnements à une série ou
-- à un canal ne sont pas modifiés par cette règle.
create policy "guests cannot follow authors"
  on public.follows as restrictive for insert to authenticated
  with check (
    target_type <> 'author'
    or not exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.is_guest
    )
  );

-- Les invités peuvent lire, mais leurs lectures ne gonflent pas les compteurs
-- ni les séries de lecture.
create or replace function public.record_streak_activity(p_streak_type text)
returns public.user_streaks
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_row public.user_streaks;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_streak_type not in ('reading', 'writing', 'community') then
    raise exception 'invalid streak type';
  end if;
  if p_streak_type = 'reading' and exists (
    select 1 from public.profiles where id = v_user_id and is_guest
  ) then
    return null;
  end if;

  select * into v_row from public.user_streaks
  where user_id = v_user_id and streak_type = p_streak_type
  for update;

  if not found then
    insert into public.user_streaks (user_id, streak_type, current_count, longest_count, last_activity_date)
    values (v_user_id, p_streak_type, 1, 1, v_today)
    returning * into v_row;
  elsif v_row.last_activity_date = v_today then
    return v_row;
  elsif v_row.last_activity_date = v_today - 1 then
    update public.user_streaks
    set current_count = v_row.current_count + 1,
        longest_count = greatest(v_row.longest_count, v_row.current_count + 1),
        last_activity_date = v_today,
        updated_at = now()
    where id = v_row.id
    returning * into v_row;
  else
    update public.user_streaks
    set current_count = 1,
        longest_count = greatest(v_row.longest_count, 1),
        last_activity_date = v_today,
        updated_at = now()
    where id = v_row.id
    returning * into v_row;
  end if;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, b.id from public.badges b
  where b.code in (
    case when v_row.current_count >= 3 then p_streak_type || '_streak_3' end,
    case when v_row.current_count >= 7 then p_streak_type || '_streak_7' end,
    case when v_row.current_count >= 30 then p_streak_type || '_streak_30' end
  )
  on conflict (user_id, badge_id) do nothing;

  perform public.award_collector_badges(v_user_id);
  return v_row;
end;
$$;

revoke all on function public.record_streak_activity(text) from public, anon;
grant execute on function public.record_streak_activity(text) to authenticated;

create or replace function public.increment_user_counter(p_counter_type text)
returns public.user_counters
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.user_counters;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_counter_type not in ('chapters_read', 'comments_posted') then
    raise exception 'invalid counter type';
  end if;
  if p_counter_type = 'chapters_read' and exists (
    select 1 from public.profiles where id = v_user_id and is_guest
  ) then
    return null;
  end if;

  insert into public.user_counters (user_id, counter_type, count)
  values (v_user_id, p_counter_type, 1)
  on conflict (user_id, counter_type) do update
    set count = user_counters.count + 1, updated_at = now()
  returning * into v_row;

  insert into public.user_badges (user_id, badge_id)
  select v_user_id, b.id from public.badges b
  where b.threshold_counter_type = p_counter_type and b.threshold_count <= v_row.count
  on conflict (user_id, badge_id) do nothing;

  perform public.award_collector_badges(v_user_id);
  return v_row;
end;
$$;

revoke all on function public.increment_user_counter(text) from public, anon;
grant execute on function public.increment_user_counter(text) to authenticated;

-- Les vues servent aussi au classement des séries. Les visites des comptes
-- invités ne doivent donc pas gonfler cette statistique; les visiteurs
-- anonymes et les autres comptes gardent le comportement existant.
create or replace function public.increment_series_views(p_series_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (
    select 1 from public.profiles
    where id = auth.uid() and is_guest
  ) then
    return;
  end if;

  update public.series set views = views + 1 where id = p_series_id;
end;
$$;

grant execute on function public.increment_series_views(uuid) to authenticated, anon;
