-- Fonctionnalités additionnelles pour la plateforme 2 (écriture) :
-- tags libres, brouillon/publié, reprise de lecture, listes de lecture.

alter table public.works add column tags text[] not null default '{}';
create index idx_works_tags on public.works using gin (tags);

alter table public.work_chapters add column is_draft boolean not null default true;

-- Un chapitre en brouillon n'est visible que par l'auteur de l'oeuvre.
drop policy "work_chapters are publicly readable" on public.work_chapters;
create policy "published work_chapters are publicly readable" on public.work_chapters for select using (
  not is_draft or exists (select 1 from public.works w where w.id = work_id and w.author_id = auth.uid())
);

-- Reprendre la lecture : un seul repère par utilisateur × oeuvre.
create table public.reading_progress (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  work_id          uuid not null references public.works(id) on delete cascade,
  last_chapter_id  uuid references public.work_chapters(id) on delete set null,
  updated_at       timestamptz not null default now(),
  primary key (user_id, work_id)
);

alter table public.reading_progress enable row level security;
create policy "users manage own reading progress" on public.reading_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Listes de lecture (collections perso, façon "à lire plus tard").
create table public.reading_lists (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.reading_list_items (
  list_id    uuid not null references public.reading_lists(id) on delete cascade,
  work_id    uuid not null references public.works(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (list_id, work_id)
);

alter table public.reading_lists enable row level security;
alter table public.reading_list_items enable row level security;

create policy "reading_lists are publicly readable" on public.reading_lists for select using (true);
create policy "users manage own reading lists" on public.reading_lists for insert with check (auth.uid() = owner_id);
create policy "users update own reading lists" on public.reading_lists for update using (auth.uid() = owner_id);
create policy "users delete own reading lists" on public.reading_lists for delete using (auth.uid() = owner_id);

create policy "reading_list_items are publicly readable" on public.reading_list_items for select using (true);
create policy "owners manage own reading list items" on public.reading_list_items for insert with check (
  exists (select 1 from public.reading_lists l where l.id = list_id and l.owner_id = auth.uid())
);
create policy "owners remove own reading list items" on public.reading_list_items for delete using (
  exists (select 1 from public.reading_lists l where l.id = list_id and l.owner_id = auth.uid())
);
