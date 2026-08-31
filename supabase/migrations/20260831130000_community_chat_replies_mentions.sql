-- Discussions de communauté façon groupe WhatsApp : répondre à un message
-- précis (reply_to_id, comme le "quote reply" WhatsApp) et mentionner un
-- membre (@pseudo) qui reçoit une notification. Volontairement pas de
-- partage de médias ici — `community_posts.media_url` reste inutilisé côté
-- groupes de fans, exactement comme un groupe WhatsApp sans les photos.

alter table public.community_posts
  add column reply_to_id uuid references public.community_posts(id) on delete set null;

create index idx_community_posts_reply_to on public.community_posts (reply_to_id);

alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('new_follower', 'new_chapter', 'migration_accepted', 'mention'));

-- Notifie chaque membre du groupe mentionné (@pseudo) dans un nouveau
-- message. On ne notifie que les vrais membres de la communauté (comme
-- WhatsApp, mentionner quelqu'un hors du groupe n'a pas de sens) et jamais
-- l'auteur du message lui-même.
create function public.notify_community_mentions()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  mentioned_username text;
  mentioned_user_id uuid;
  author_name text;
  community_name text;
begin
  select display_name into author_name from public.profiles where id = new.author_id;
  select name into community_name from public.communities where id = new.community_id;

  for mentioned_username in
    select distinct lower(m[1]) from regexp_matches(new.body, '@([a-zA-Z0-9_]+)', 'g') as m
  loop
    select cm.user_id into mentioned_user_id
    from public.community_members cm
    join public.profiles p on p.id = cm.user_id
    where cm.community_id = new.community_id and lower(p.username) = mentioned_username;

    if mentioned_user_id is not null and mentioned_user_id != new.author_id then
      insert into public.notifications (user_id, type, title, body, link_path)
      values (
        mentioned_user_id,
        'mention',
        'Tu as été mentionné(e)',
        coalesce(author_name, 'Quelqu''un') || ' t''a mentionné(e) dans ' || coalesce(community_name, 'une communauté'),
        '/communaute/' || new.community_id
      );
    end if;
  end loop;

  return new;
end;
$$;

create trigger on_community_post_mention_notify
  after insert on public.community_posts
  for each row execute procedure public.notify_community_mentions();

revoke execute on function public.notify_community_mentions() from anon, authenticated;
