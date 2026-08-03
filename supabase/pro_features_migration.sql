-- Migration Remedly Pro : Alertes 24h %, Portfolio Snapshots et Weekly Digest
-- À exécuter dans Supabase -> SQL Editor

-- 1. Ajout de la colonne alert_type dans price_alerts et weekly_digest dans users
alter table public.price_alerts add column if not exists alert_type text default 'threshold';
alter table public.users add column if not exists weekly_digest boolean default true;

-- 2. Création de la table portfolio_snapshots
create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  snapshot_date date not null,
  total_value_eur numeric not null default 0,
  created_at timestamptz not null default now(),
  constraint unique_user_snapshot_date unique (user_id, snapshot_date)
);

create index if not exists portfolio_snapshots_user_date_idx on public.portfolio_snapshots (user_id, snapshot_date);

-- 3. Grants de sécurité pour service_role
grant select, insert, update, delete on public.portfolio_snapshots to service_role;
grant select, insert, update, delete on public.price_alerts to service_role;
grant select, insert, update, delete on public.users to service_role;
