@AGENTS.md

# Project Guardrails — Remedly

Ce projet a un historique de tentatives répétées d'ajouter des fonctionnalités
qui entrent en conflit avec son positionnement légal, ou de régressions sur
des points déjà corrigés. Les règles ci-dessous existent pour que ces mêmes
discussions n'aient pas à être refaites à chaque session.

## 1. Frontière réglementaire — ligne dure, sans exception

Le footer et `/plateforme` affirment : *"Remedly édite exclusivement une
interface logicielle et agit en qualité d'apporteur d'affaires. Remedly n'est
ni un Prestataire de Services sur Actifs Numériques (PSAN) au sens de l'AMF,
ni un prestataire CASP au sens de MiCA. Remedly ne fournit aucun conseil en
investissement, n'exécute pas d'ordres sur actifs numériques et ne conserve
à aucun moment les fonds ou les clés privées de ses utilisateurs."*

Toute fonctionnalité doit rester compatible avec cette phrase. Ça ne veut
pas dire les refuser d'emblée sans en discuter — l'idée doit être explorée
normalement, mais **le risque réglementaire doit être nommé clairement dans
la discussion** avant tout développement, pour que la décision de foncer ou
d'attendre reste un choix informé du fondateur, pas un blocage automatique :
- **Sell / vente de crypto** (déjà tenté puis retiré une première fois)
- **Swap / échange de cryptos** (contredit "n'exécute pas d'ordres")
- **DeFi, staking, "génération de rendement"** — le point sensible est
  surtout d'afficher un pourcentage de rendement promis avant d'avoir
  vérifié que c'est compatible avec le statut actuel.
- Toute fonctionnalité qui fait interagir le wallet avec un smart contract
  tiers pour le compte de l'utilisateur (Aave, Uniswap, etc.)

Dans tous les cas : en discuter, poser le risque sur la table, et laisser
le fondateur trancher — ne pas fermer la porte sans échange.

Le "Send" (envoi de cryptos vers une autre adresse) est une exception
tolérée mais **encadrée** : il doit rester derrière un kill switch
(`NEXT_PUBLIC_ENABLE_SEND`), avec un écran de confirmation explicite avant
tout envoi, et ne doit être activé en production qu'après un premier achat
réel confirmé de bout en bout (voir section 3).

## 2. Contenu et marketing — rien d'inventé

- **Jamais de statistique fabriquée** (nombre d'utilisateurs, note de
  satisfaction, témoignages) tant qu'elle n'est pas réellement vérifiable.
  Un précédent existe : "Rejoignez plus de 10 000 utilisateurs" a été
  affiché puis retiré faute d'être vrai.
- **Jamais d'avis client fabriqué.** Un widget de type Trustpilot n'est
  acceptable que s'il affiche des avis réellement collectés et vérifiables
  (Code de la consommation, art. L.111-7-2 — sanctionné par la DGCCRF).
- **Jamais d'article de blog ou de contenu qui décrit une fonctionnalité
  non construite** comme si elle existait déjà.
- Tout logo tiers (Visa, Mastercard, Apple Pay, logos de cryptos...) doit
  être hébergé localement dans `/public`, jamais hotlinké depuis un site
  externe (Wikipedia, cryptologos.cc...). C'est déjà arrivé deux fois sur
  ce projet (une fois corrigé, une fois réintroduit avec l'ajout d'USDC/XRP
  dans le simulateur) — vérifier systématiquement les nouveaux imports
  d'images avant de les committer.

## 3. Ce qui n'est toujours pas vérifié en conditions réelles

- **Aucun achat réel de bout en bout n'a jamais été confirmé** sur ETH, SOL
  ou BTC avec un vrai compte Privy (pas mock). Le mapping de l'adresse
  Bitcoin (`user.linkedAccounts` filtré sur `chainType === 'bitcoin-taproot'`)
  a été codé par déduction depuis la documentation Privy, jamais confirmé
  contre un vrai objet `user`. Faire ce test avant toute nouvelle feature
  qui dépend du wallet.
- Le mainnet reste bloqué en attendant la validation des dossiers chez
  Transak et MoonPay — ne pas basculer dessus sans confirmation explicite.
- Vérifier qu'une clé API Etherscan (ou équivalent pour les futurs appels
  Solana/Bitcoin) est bien configurée avant tout trafic réel, pour éviter
  le rate-limiting silencieux déjà identifié.

## 4. Hygiène technique à ne pas oublier

- Les fichiers `'use server'` (dossier `app/actions/`) ne doivent exporter
  que des fonctions async. Les types doivent être importés avec
  `import type`, jamais un import normal — un mélange des deux a déjà
  cassé toute la page `/portefeuille` en production (`ReferenceError:
  Transaction is not defined`).
- Ne pas définir de composant React à l'intérieur du corps d'un autre
  composant (React le remonte entièrement à chaque render au lieu de le
  mettre à jour — déjà arrivé sur `WalletBalance`/`AddressRow`).
- Avant de déclarer une fonctionnalité "terminée", vérifier en conditions
  proches du réel (navigateur, pas juste `npm test`) — plusieurs bugs
  bloquants de cette session (crash post-authentification, page 500) sont
  passés inaperçus des tests unitaires seuls.
