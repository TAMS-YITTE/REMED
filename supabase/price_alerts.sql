-- Alertes de prix Remedly Pro. À exécuter dans Supabase → SQL Editor.
-- Le cron /api/cron/check-alerts lit/écrit via service_role : GRANT requis.

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  privy_id text,
  email text not null,
  crypto text not null,                 -- symbole minuscule (btc, eth...)
  direction text not null,              -- 'above' | 'below'
  target_price numeric not null,        -- seuil en EUR
  active boolean not null default true,
  triggered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists price_alerts_privy_id_idx on public.price_alerts (privy_id);
create index if not exists price_alerts_active_idx on public.price_alerts (active);

grant select, insert, update, delete on public.price_alerts to service_role;
