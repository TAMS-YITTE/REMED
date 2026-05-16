-- ═══════════════════════════════════════════════════════════════
-- ReMed — Schéma Supabase
-- À exécuter dans le SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- ANNONCES (matériel d'occasion)
create table if not exists annonces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  titre text not null,
  description text not null,
  categorie text not null,
  etat text not null,
  prix numeric not null,
  ville text,
  region text,
  marque text,
  modele text,
  annee int,
  statut text default 'active',
  urgent boolean default false,
  contact_email text not null,
  contact_tel text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_annonces_categorie on annonces(categorie);
create index if not exists idx_annonces_region on annonces(region);
create index if not exists idx_annonces_statut on annonces(statut);
create index if not exists idx_annonces_user on annonces(user_id);

-- MESSAGES envoyés via formulaire de contact
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  annonce_id uuid references annonces(id) on delete cascade,
  from_email text not null,
  from_nom text not null,
  texte text not null,
  created_at timestamptz default now()
);

alter table users disable row level security;
alter table annonces disable row level security;
alter table messages disable row level security;
