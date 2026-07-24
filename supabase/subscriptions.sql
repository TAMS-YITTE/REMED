-- Table des abonnements Remedly Pro (Stripe).
-- À exécuter dans Supabase → SQL Editor.
-- Le webhook /api/webhooks/stripe y écrit via le rôle service_role : les GRANT
-- en fin de fichier sont indispensables (sinon "permission denied 42501").

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  privy_id text,
  stripe_customer_id text,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_privy_id_idx on public.subscriptions (privy_id);

-- Droits pour le rôle serveur utilisé par le webhook et les server actions.
grant select, insert, update on public.subscriptions to service_role;
