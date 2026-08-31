-- Permet aux 3 apps de s'abonner en temps réel à leurs propres notifications
-- (NotificationBell) sans avoir à repoller l'API.
alter publication supabase_realtime add table public.notifications;
