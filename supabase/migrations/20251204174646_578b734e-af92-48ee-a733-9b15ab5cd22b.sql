-- Habilitar realtime para notificações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.newsletter_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;