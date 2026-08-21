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

## 3. Ce qui est vérifié en conditions réelles (2026-08-21)

Les achats **et** les envois sont désormais validés sur mainnet, avec de
vrais fonds et un vrai compte Privy. Ne plus traiter ces points comme
incertains, et ne pas refaire le diagnostic depuis le début :

- **Achats** confirmés on-chain sur ETH, BTC (taproot), SOL et LINK
  (ERC-20). Le mapping de l'adresse Bitcoin via `user.linkedAccounts`
  filtré sur `chainType === 'bitcoin-taproot'`, codé par déduction, est
  **validé** : l'adresse reçoit réellement des BTC.
- **Envois** validés sur les quatre chemins : ETH natif, ERC-20 (25,6 LINK),
  SOL (`2QcQxRjDqHior…`), BTC taproot (`0541fae7f34ab4ef…`, puis
  `3b98cea5c3bba6e1…` à deux entrées).
- **MoonPay est validé (OK) et actif en Mainnet**. L'intégration BANXA est définitivement abandonnée.
- `NEXT_PUBLIC_ENABLE_SEND` est à **`true` en production**. La valeur est
  comparée strictement à la chaîne `'true'`, et figée au build : une
  modification dans Vercel n'a d'effet qu'après redéploiement.

**Restent non vérifiés** : l'export des clés privées (`ExportKeys`, branché
sur `/portefeuille` mais jamais exécuté), et l'écriture d'une ligne dans la
table `transactions` après un achat réel.

**Coût réel d'un achat** : mesuré à ~6 % sur un achat LINK de 250 € (250 €
payés pour 234,92 € de crypto au cours du moment), alors que le simulateur
de la page d'accueil annonce 1,99 %. La divulgation tarifaire MoonPay
confirme le mécanisme : jusqu'à 4,5 % de frais, une majoration de 0,25 à
10 % hors USD, et surtout un **spread intégré au prix affiché**, jamais
présenté séparément. Le 1,99 % affiché est donc faux pour le client.
À corriger en lisant la cotation MoonPay côté navigateur plutôt qu'en
écrivant un pourcentage en dur.

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
- **Ne jamais caster la config Privy en `as any`.** `noPromptOnSignature`
  y a survécu des mois alors que cette clé n'existe pas dans le SDK v3 :
  elle était ignorée, l'interface de Privy restait donc active à l'insu de
  tous, et sa fenêtre de signature n'aboutissait pas — l'envoi restait figé
  sans message. La clé correcte est `showWalletUIs`, à `false` puisque
  l'application a son propre écran de confirmation.

## 5. Pièges Privy identifiés en conditions réelles (à ne pas réintroduire)

Chacun de ces points a coûté un cycle de diagnostic complet :

- **Toujours passer `chain`** à une méthode Solana. Sans lui, Privy diffuse
  sur son réseau par défaut, où le blockhash mainnet est inconnu : la
  transaction n'est jamais confirmée et l'attente ne se termine pas.
  Identifiant CAIP-2 mainnet : `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`.
- **`useRegisterMfaListener` doit être monté** près de la racine (voir
  `MfaListener` dans `app/providers.tsx`). Quand la 2FA est active, Privy
  attend que l'application affiche la saisie ; sans écoute, rien ne
  s'affiche et la promesse de signature ne se résout jamais.
- **Ne demander à Privy que la signature**, et diffuser soi-même.
  `signAndSendTransaction` attend une confirmation par souscription
  WebSocket qui ne se termine pas ici.
- **Bitcoin** : Privy ne sait que signer un hash (`useSignRawHash`, tweak
  BIP-341 appliqué par leurs soins). Le sighash taproot engage **toutes**
  les entrées — passer seulement l'entrée courante à `preimageWitnessV1`
  fonctionne à une entrée et échoue dès la deuxième
  (`Invalid amounts array`). L'arithmétique (entrées, frais, monnaie) est
  isolée sans dépendance dans `lib/bitcoinPlan.ts` et testée seule : c'est
  là qu'une erreur enverrait le solde aux mineurs.
- **Les hooks Privy non-EVM plantent au rendu serveur**
  (`useWallets was called outside the PrivyProvider`). Les composants qui
  les utilisent sont chargés en `dynamic(..., { ssr: false })`.
- **Toute table lue par une action serveur a besoin d'un `GRANT` explicite**
  pour `service_role`. `saved_wallets` avait SELECT et INSERT mais pas
  DELETE : la suppression échouait en 42501, sans message exploitable.
  Migrations dans `supabase/`.
- **Le gaz d'un transfert ERC-20 se paie en ETH.** Une adresse sans ETH a
  ses jetons immobilisés, et réduire le montant du jeton n'y change rien —
  piège classique pour un utilisateur qui vient de vider son ETH.
