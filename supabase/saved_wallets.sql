-- Carnet d'adresses (table créée à la main, sans migration jusqu'ici).
--
-- Les actions serveur passent par le rôle `service_role`. Sans GRANT
-- explicite, chaque appel échoue en "permission denied" (42501) — c'est ce
-- qui rendait la suppression d'une adresse impossible, alors que la lecture
-- et l'insertion fonctionnaient.
--
-- À exécuter dans Supabase → SQL Editor. Idempotent.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_wallets TO service_role;

-- Si la table utilise une séquence pour son identifiant :
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Vérification : doit renvoyer une ligne par privilège accordé.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'saved_wallets' AND grantee = 'service_role';
