# Remedly — Brief de reprise (2026-07-17)

Contexte pour une nouvelle conversation Claude Code sur ce projet. Colle ce
fichier en premier message, ou demande à Claude de le lire.

## C'est quoi Remedly

Onramp crypto B2C : achat de Bitcoin, Ethereum, Solana par carte bancaire ou
virement, via **Transak** et **MoonPay** comme prestataires de paiement
réglementés, avec un wallet **non-custodial** généré automatiquement par
**Privy** (pas de seed phrase, récupération par simple email).

Le projet a **pivoté** depuis une idée initiale de courtage B2B (déstockage/
matériel pro d'occasion) — cette ancienne piste est abandonnée, ignorer toute
trace qui en parlerait encore.

## Positionnement légal — le pilier de tout le produit

Remedly se déclare "apporteur d'affaires", explicitement **ni PSAN (AMF) ni
CASP (MiCA)**. Le raisonnement : Privy/Transak/MoonPay portent la garde des
fonds et l'exécution réglementée, Remedly n'est qu'une interface logicielle.
Cette phrase exacte est répétée dans le footer et sur `/plateforme` :

> "Remedly édite exclusivement une interface logicielle et agit en qualité
> d'apporteur d'affaires. Remedly n'est ni un Prestataire de Services sur
> Actifs Numériques (PSAN) au sens de l'AMF, ni un prestataire CASP au sens
> de MiCA. Remedly ne fournit aucun conseil en investissement, n'exécute
> pas d'ordres sur actifs numériques et ne conserve à aucun moment les
> fonds ou les clés privées de ses utilisateurs."

**Toute nouvelle fonctionnalité doit rester compatible avec cette phrase.**
Le repo a un `CLAUDE.md` avec des garde-fous détaillés là-dessus (Sell/Swap/
DeFi-yield à discuter systématiquement avant tout développement, pas à
bloquer d'emblée sans échange — le fondateur tranche, Claude nomme le
risque).

## Stack & accès

- Next.js/TypeScript, Tailwind, framer-motion
- Repo local : `C:\Users\hp\Documents\remedly`
- GitHub : `TAMS-YITTE/REMED`
- Déployé sur Vercel : https://www.remedly.fr (déploiement automatique sur
  push, très réactif)
- Tests Jest : 61 tests verts au dernier check, `npm test` / `npm run build`
- Serveur de dev local configuré dans `.claude/launch.json` (global,
  `C:\Users\hp\.claude\launch.json`) sous le nom `remedly-dev`, port 3007

## Ce qui marche (vérifié)

- Wallets multi-chaînes créés automatiquement à la connexion : Ethereum et
  Solana (auto via Privy `createOnLogin`), Bitcoin (Tier 2, création à la
  demande via `@privy-io/react-auth/extended-chains`)
- Parcours d'achat `/acheter` avec sélection ETH/SOL/BTC, widgets Transak
  et MoonPay avec bascule si l'un est bloqué
- Portefeuille `/portefeuille` : soldes réels (Sepolia/devnet/testnet,
  **pas mainnet**), conversion en euros (CoinGecko), donut de répartition,
  historique de transactions unifié, envoi de fonds (`Send`) derrière un
  kill switch `NEXT_PUBLIC_ENABLE_SEND` (désactivé par défaut)
- Homepage refaite (mode sombre, simulateur d'achat multi-crypto avec prix
  live), section blog `/apprendre` (5 articles), page produit `/plateforme`
- SEO de base : `sitemap.ts`, `robots.ts`, JSON-LD FAQPage

## Ce qui n'est PAS vérifié — le plus important

**Aucun achat réel de bout en bout n'a jamais été confirmé** avec un vrai
compte Privy (pas mock). En particulier, le mapping de l'adresse wallet
Bitcoin (`user.linkedAccounts.find(a => a.type === 'wallet' && a.chainType
=== 'bitcoin-taproot')`) est une déduction faite depuis la documentation
Privy, jamais vérifiée contre un vrai objet `user` en session réelle.

**Mainnet bloqué** en attendant la validation des dossiers chez Transak et
MoonPay (en cours côté fondateur au 2026-07-17 — ne pas basculer dessus
sans confirmation explicite).

## Bugs déjà rencontrés et corrigés (pour ne pas les refaire)

- Fichiers `'use server'` (`app/actions/`) : n'exporter QUE des fonctions
  async, toujours `import type` pour les types — un mélange a cassé toute
  la page `/portefeuille` en prod (`ReferenceError: Transaction is not
  defined`)
- Ne jamais définir de composant React à l'intérieur d'un autre composant
  (remonté entièrement à chaque render, pas juste mis à jour)
- Logos tiers (Visa, Mastercard, logos de cryptos) : toujours en local dans
  `/public`, jamais hotlinkés — récidive déjà survenue une fois
  (cryptologos.cc réintroduit avec USDC/XRP)
- Aucune statistique ou avis client fabriqué (ex : "10 000 utilisateurs"
  affiché puis retiré faute d'être vrai)
- Le défaut de crypto sur `/acheter` doit être `eth`, jamais `btc` (le
  wallet par défaut est Ethereum-only historiquement, corrigé depuis)

## Prochaines étapes suggérées

1. Faire un vrai test d'achat de bout en bout (vrai compte, pas mock) sur
   les 3 chaînes dès que possible — c'est le trou noir de tout le projet.
2. Vérifier qu'une clé API Etherscan est configurée en prod (rate-limit
   silencieux sinon).
3. Ajouter un monitoring d'erreurs (Sentry ou équivalent) — le crash 500 de
   `/portefeuille` est resté invisible jusqu'à une vérification manuelle.
4. Suivre l'avancement de la validation Transak/MoonPay avant tout
   basculement mainnet.

## Où trouver plus de détails

- `CLAUDE.md` à la racine du repo — garde-fous à jour, se charge
  automatiquement dans le contexte de toute session Claude Code sur ce repo
- Mémoire persistante Claude : `project_remedly.md` (état projet),
  `feedback_gendarme_calibration.md` (comment traiter les risques
  réglementaires : les nommer, pas bloquer d'emblée)
