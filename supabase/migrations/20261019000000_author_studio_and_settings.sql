-- Author drafts, publishing gates, and general support reports.
-- This migration is intentionally not applied automatically to any database.

alter table public.series
  add column if not exists is_published boolean not null default true;

-- Preserve existing public series. New author drafts explicitly set is_published=false.
drop policy if exists "series are publicly readable" on public.series;
create policy "published series and their authors are readable" on public.series for select using (
  is_published
  or author_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);

drop policy if exists "authors manage own series" on public.series;
create policy "authorized lecture authors create own series" on public.series for insert with check (
  author_id = (select auth.uid())
  and is_published = false
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
);

drop policy if exists "authors update own series" on public.series;
create policy "authorized lecture authors update own series" on public.series for update
  using (author_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author))
  with check (author_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author));

drop policy if exists "authors delete own series" on public.series;
drop policy if exists "authors or admins delete series" on public.series;
create policy "authors or admins delete series" on public.series for delete using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
  or (author_id = (select auth.uid()) and not is_published and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author))
);

drop policy if exists "series_genres are publicly readable" on public.series_genres;
create policy "published series genres are readable" on public.series_genres for select using (
  exists (select 1 from public.series s where s.id = series_id and (s.is_published or s.author_id = (select auth.uid()) or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)))
);
drop policy if exists "authors tag own series" on public.series_genres;
create policy "authorized lecture authors tag own series" on public.series_genres for insert with check (
  exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author)
);
drop policy if exists "authors untag own series" on public.series_genres;
create policy "authorized lecture authors untag own series" on public.series_genres for delete using (
  exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author)
);

drop policy if exists "chapters are publicly readable" on public.chapters;
create policy "published chapters and their authors are readable" on public.chapters for select using (
  exists (select 1 from public.series s where s.id = series_id and ((s.is_published and chapters.published_at is not null) or s.author_id = (select auth.uid())))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
drop policy if exists "authors manage own chapters" on public.chapters;
create policy "authorized lecture authors create own chapters" on public.chapters for insert with check (
  exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author)
  and published_at is null
);
drop policy if exists "authors update own chapters" on public.chapters;
create policy "authorized lecture authors update own chapters" on public.chapters for update
  using (exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author))
  with check (exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author));
drop policy if exists "authors delete own chapters" on public.chapters;
drop policy if exists "authors or admins delete chapters" on public.chapters;
create policy "authors or admins delete chapters" on public.chapters for delete using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
  or (published_at is null and exists (select 1 from public.series s join public.profiles p on p.id = s.author_id where s.id = series_id and s.author_id = (select auth.uid()) and p.is_lecture_author))
);

drop policy if exists "chapter_pages are publicly readable" on public.chapter_pages;
create policy "published chapter pages and their authors are readable" on public.chapter_pages for select using (
  exists (select 1 from public.chapters c join public.series s on s.id = c.series_id where c.id = chapter_id and ((c.published_at is not null and s.is_published) or s.author_id = (select auth.uid())))
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
drop policy if exists "authors manage own chapter pages" on public.chapter_pages;
create policy "authorized lecture authors create own chapter pages" on public.chapter_pages for insert with check (
  exists (select 1 from public.chapters c join public.series s on s.id = c.series_id join public.profiles p on p.id = s.author_id where c.id = chapter_id and s.author_id = (select auth.uid()) and p.is_lecture_author)
);
drop policy if exists "authors delete own chapter pages" on public.chapter_pages;
create policy "authorized lecture authors delete draft chapter pages" on public.chapter_pages for delete using (
  exists (select 1 from public.chapters c join public.series s on s.id = c.series_id join public.profiles p on p.id = s.author_id where c.id = chapter_id and c.published_at is null and s.author_id = (select auth.uid()) and p.is_lecture_author)
);
create policy "authorized lecture authors update own chapter pages" on public.chapter_pages for update
  using (exists (select 1 from public.chapters c join public.series s on s.id = c.series_id join public.profiles p on p.id = s.author_id where c.id = chapter_id and s.author_id = (select auth.uid()) and p.is_lecture_author))
  with check (exists (select 1 from public.chapters c join public.series s on s.id = c.series_id join public.profiles p on p.id = s.author_id where c.id = chapter_id and s.author_id = (select auth.uid()) and p.is_lecture_author));

-- Private staging bucket for images belonging to unpublished author drafts.
insert into storage.buckets (id, name, public)
values ('author-drafts', 'author-drafts', false)
on conflict (id) do nothing;
create policy "lecture authors manage their private draft assets" on storage.objects for all using (
  bucket_id = 'author-drafts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
) with check (
  bucket_id = 'author-drafts'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
);

-- Restrict uploads to named Lecture authors; the public buckets remain public for published assets.
drop policy if exists "users upload series covers to their own folder" on storage.objects;
create policy "lecture authors upload series covers to their own folder" on storage.objects for insert with check (
  bucket_id = 'series-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
);
drop policy if exists "users manage their own series covers" on storage.objects;
create policy "lecture authors update their own series covers" on storage.objects for update
  using (bucket_id = 'series-covers' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author))
  with check (bucket_id = 'series-covers' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author));
drop policy if exists "users delete their own series covers" on storage.objects;
create policy "lecture authors delete their own series covers" on storage.objects for delete using (
  bucket_id = 'series-covers' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
);
drop policy if exists "users upload chapter pages to their own folder" on storage.objects;
create policy "lecture authors upload chapter pages to their own folder" on storage.objects for insert with check (
  bucket_id = 'chapter-pages' and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author)
);
drop policy if exists "users manage their own chapter pages" on storage.objects;
create policy "lecture authors update their own chapter pages" on storage.objects for update
  using (bucket_id = 'chapter-pages' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author))
  with check (bucket_id = 'chapter-pages' and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_lecture_author));
-- Public chapter-page objects are retained to protect published chapters and purchase history.
drop policy if exists "users delete their own chapter pages" on storage.objects;

-- Atomic page reordering avoids transient unique(series_id, page_number) collisions.
create or replace function public.reorder_author_chapter_pages(p_chapter_id uuid, p_page_ids uuid[])
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_count integer;
  i integer;
begin
  if not exists (
    select 1 from public.chapters c
    join public.series s on s.id = c.series_id
    join public.profiles p on p.id = s.author_id
    where c.id = p_chapter_id and s.author_id = (select auth.uid()) and p.is_lecture_author
  ) then
    raise exception 'not authorized';
  end if;

  select count(*) into v_count from public.chapter_pages where chapter_id = p_chapter_id;
  if cardinality(coalesce(p_page_ids, array[]::uuid[])) <> v_count
    or (select count(distinct requested.id) from unnest(coalesce(p_page_ids, array[]::uuid[])) as requested(id)) <> v_count
    or exists (
      select 1 from unnest(coalesce(p_page_ids, array[]::uuid[])) as requested(id)
      left join public.chapter_pages cp on cp.id = requested.id and cp.chapter_id = p_chapter_id
      where cp.id is null
    ) then
    raise exception 'invalid page order';
  end if;

  for i in 1..v_count loop
    update public.chapter_pages set page_number = -(1000000 + i) where id = p_page_ids[i];
  end loop;
  for i in 1..v_count loop
    update public.chapter_pages set page_number = i where id = p_page_ids[i];
  end loop;
end;
$$;
revoke all on function public.reorder_author_chapter_pages(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_author_chapter_pages(uuid, uuid[]) to authenticated;

-- General support reports are distinct from reports against published content.
create table if not exists public.support_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in ('technical', 'inappropriate', 'copyright', 'account', 'security', 'other')),
  description text not null check (char_length(btrim(description)) between 10 and 5000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists idx_support_reports_created_at on public.support_reports (created_at);
alter table public.support_reports enable row level security;
create policy "users create own support reports" on public.support_reports for insert with check ((select auth.uid()) = reporter_id);
create policy "admins view support reports" on public.support_reports for select using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin)
);
create policy "admins resolve support reports" on public.support_reports for update
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_platform_admin));
