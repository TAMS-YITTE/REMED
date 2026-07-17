export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Débutant' | 'Sécurité' | 'Crypto';
  date: string;
  readTime: string;
}

export const articles: Article[] = [
  {
    slug: 'cest-quoi-la-blockchain',
    title: "C'est quoi la blockchain ? Explication simple",
    excerpt: "Découvrez ce qu'est la blockchain, cette technologie révolutionnaire derrière les cryptomonnaies, expliquée simplement et sans jargon.",
    category: 'Débutant',
    date: '16 Juillet 2026',
    readTime: '3 min',
    content: `
## La blockchain, un grand livre de comptes ouvert à tous

Imaginez un grand livre de comptes dans lequel toutes les transactions d'une entreprise sont notées. Traditionnellement, ce livre est gardé secret par l'entreprise (par exemple, votre banque). Seule la banque peut écrire dedans, et vous devez lui faire confiance.

**La blockchain (ou chaîne de blocs), c'est exactement la même chose, à trois grandes différences près :**

1. **Elle est publique et transparente :** Tout le monde peut consulter ce livre de comptes à tout moment. Vous pouvez vérifier qu'une transaction a bien eu lieu sans avoir à demander la permission à qui que ce soit.
2. **Elle est décentralisée :** Le livre n'est pas stocké sur un seul ordinateur appartenant à une entreprise, mais sur des milliers d'ordinateurs (appelés "nœuds") répartis dans le monde entier.
3. **Elle est inaltérable :** Une fois qu'une ligne est écrite dans ce livre (une transaction est validée), il est mathématiquement impossible de l'effacer ou de la modifier.

### Comment ça marche concrètement ?

Quand vous envoyez de la cryptomonnaie à un ami :
1. **La demande :** Votre demande de transaction est envoyée au réseau.
2. **Le bloc :** Elle est regroupée avec d'autres transactions récentes dans ce qu'on appelle un "bloc".
3. **La validation :** Les ordinateurs du réseau (les mineurs ou les validateurs) vérifient que vous avez bien les fonds nécessaires.
4. **L'enchaînement :** Une fois validé, ce bloc est scellé cryptographiquement et rattaché au bloc précédent. D'où le nom de "chaîne de blocs" !

### Pourquoi est-ce une révolution ?

Parce que pour la première fois dans l'histoire de l'humanité, des personnes qui ne se connaissent pas peuvent s'échanger de la valeur de manière totalement sécurisée sur Internet, **sans avoir besoin d'un intermédiaire de confiance** (comme une banque, un notaire ou un État). C'est ce qui rend Bitcoin et les autres cryptomonnaies uniques.
    `
  },
  {
    slug: 'comment-securiser-ses-actifs',
    title: "Comment sécuriser ses cryptos : le guide ultime",
    excerpt: "Ne laissez pas vos cryptos à la merci des hackers. Apprenez les règles de base pour sécuriser vos actifs numériques en toute simplicité.",
    category: 'Sécurité',
    date: '15 Juillet 2026',
    readTime: '4 min',
    content: `
## "Not your keys, not your coins"

Dans le monde de la crypto, vous êtes votre propre banque. Cela offre une liberté incroyable, mais cela s'accompagne d'une grande responsabilité : c'est à vous de sécuriser vos fonds.

L'adage le plus célèbre de l'écosystème est *"Not your keys, not your coins"* (Pas vos clés, pas vos pièces). Si vous laissez vos cryptos sur une plateforme d'échange classique (un exchange centralisé), vous ne possédez pas vraiment vos cryptos, c'est la plateforme qui les possède pour vous. Si elle fait faillite, vous perdez tout.

### Les différentes façons de stocker ses cryptos

Il existe deux grandes catégories de portefeuilles (wallets) :

1. **Les Hot Wallets (Portefeuilles chauds) :** Ce sont des portefeuilles connectés à Internet (ex: Metamask, Phantom). Ils sont très pratiques pour interagir avec des applications, mais plus vulnérables aux piratages informatiques.
2. **Les Cold Wallets (Portefeuilles froids) :** Ce sont des appareils physiques (souvent semblables à des clés USB, ex: Ledger ou Trezor) qui gardent vos clés privées hors ligne. C'est le moyen le plus sûr de stocker des sommes importantes.

### La méthode Remedly : l'approche hybride et sécurisée

Chez **Remedly**, nous avons fait le choix de l'innovation avec la technologie *Embedded Wallet* (fournie par Privy). 
- Votre portefeuille est **100% non-custodial** : nous n'avons pas accès à vos fonds.
- Vous n'avez **pas de "Seed Phrase"** (la fameuse suite de 12 à 24 mots) à écrire sur un bout de papier et à cacher sous votre matelas.
- Votre portefeuille est généré et lié cryptographiquement à votre adresse email ou votre compte Google. 

C'est aujourd'hui le compromis parfait entre la sécurité d'un portefeuille décentralisé et la simplicité d'une application classique.

### 3 règles d'or de la sécurité

1. **Méfiez-vous des rendements irréalistes :** Si quelqu'un vous promet de doubler vos cryptos en 2 jours, c'est une arnaque.
2. **Ne partagez jamais vos codes ou vos clés :** Aucun support technique légitime ne vous demandera jamais votre mot de passe, vos codes de double authentification, ou votre seed phrase.
3. **Double authentification (2FA) :** Activez toujours la double authentification sur vos boîtes mail et vos comptes crypto.
    `
  },
  {
    slug: 'bitcoin-ethereum-solana-differences-debutant',
    title: "Bitcoin, Ethereum, Solana : quelles différences pour un débutant ?",
    excerpt: "Vous débutez et vous vous perdez parmi les milliers de cryptomonnaies ? Voici un guide simple pour comprendre les 3 plus grands projets de l'écosystème.",
    category: 'Crypto',
    date: '16 Juillet 2026',
    readTime: '5 min',
    content: `
## L'écosystème crypto ne se résume pas à Bitcoin

Quand on débute, il est facile de penser que "Crypto = Bitcoin". S'il est vrai que Bitcoin est le précurseur et le leader incontesté, il existe aujourd'hui des milliers d'autres projets appelés des *altcoins* (alternative coins). 

Parmi eux, **Ethereum** et **Solana** se détachent du lot. Mais à quoi servent-ils ? Sont-ils des concurrents de Bitcoin ? Faisons le point simplement.

### 1. Bitcoin (BTC) : L'or numérique et la réserve de valeur

Créé en 2009, Bitcoin a un objectif simple mais révolutionnaire : être une **monnaie numérique décentralisée**, incensurable et avec une masse monétaire fixe (il n'y aura jamais plus de 21 millions de bitcoins).

* **Son but principal :** Transférer de la valeur de manière sécurisée et servir de réserve de valeur contre l'inflation.
* **L'analogie :** C'est l'**Or numérique**. On l'achète pour le conserver à long terme.
* **Point fort :** C'est le réseau le plus ancien, le plus décentralisé et le plus sécurisé au monde.
* **Point faible :** Il est relativement lent (environ 10 minutes pour confirmer une transaction) et ne permet pas facilement de créer des applications complexes.

### 2. Ethereum (ETH) : L'ordinateur mondial

Lancé en 2015, Ethereum ne cherche pas à concurrencer Bitcoin sur le terrain de la réserve de valeur pure. Son objectif est d'être un **ordinateur géant mondial**. 

Ethereum a introduit les *Smart Contracts* (contrats intelligents). Ce sont de petits programmes informatiques qui s'exécutent automatiquement sur la blockchain. Grâce à eux, on peut créer des applications financières (la DeFi) ou des œuvres d'art numériques (les NFTs).

* **Son but principal :** Servir d'infrastructure (comme iOS ou Android) sur laquelle les développeurs peuvent créer des applications décentralisées.
* **L'analogie :** C'est le **Pétrole numérique** ou le cloud mondial. On a besoin d'ETH pour faire fonctionner le réseau.
* **Point fort :** Un écosystème d'applications gigantesque et une innovation constante.
* **Point faible :** Les frais de transaction peuvent devenir très élevés lorsque le réseau est très sollicité.

### 3. Solana (SOL) : La Formule 1 des blockchains

Solana, lancé en 2020, est souvent qualifié d'"Ethereum Killer". Il part du même principe qu'Ethereum (permettre de créer des applications décentralisées), mais avec une architecture technique différente axée sur la **vitesse** et les **frais ultra-réduits**.

* **Son but principal :** Être la blockchain la plus rapide pour un usage quotidien (paiements, jeux, trading haute fréquence).
* **L'analogie :** C'est le **Réseau Visa/Mastercard** de la crypto. Construit pour la vitesse.
* **Point fort :** Peut traiter des milliers de transactions par seconde pour des frais inférieurs à 1 centime.
* **Point faible :** Il a connu quelques pannes techniques dans ses premières années, bien que le réseau soit de plus en plus stable aujourd'hui. Il est aussi considéré comme moins décentralisé qu'Ethereum.

### Résumé pour vos investissements

Pour un investisseur débutant, ces 3 cryptomonnaies constituent souvent la base d'un portefeuille solide :
* **Bitcoin** pour la sécurité et le long terme.
* **Ethereum** pour parier sur le développement de la finance décentralisée et du Web3.
* **Solana** pour son adoption massive liée à sa vitesse et ses faibles frais.

*Rappel : Sur Remedly, vous pouvez acheter ces trois actifs directement avec votre carte bancaire.* 
    `
  },
  {
    slug: 'comprendre-les-stablecoins',
    title: "Comprendre les stablecoins (USDC/USDT) : le refuge en temps de crise",
    excerpt: "Comment se protéger de la volatilité du marché crypto sans avoir à revendre en euros ? Découvrez la puissance des stablecoins.",
    category: 'Débutant',
    date: '17 Juillet 2026',
    readTime: '4 min',
    content: `
## La volatilité : l'ennemi numéro 1 du débutant

Le marché des cryptomonnaies est connu pour sa très forte volatilité. Le Bitcoin peut gagner 10% un jour et en perdre 15% le lendemain. Cette montagne russe émotionnelle peut être très difficile à gérer pour un investisseur débutant.

Historiquement, la seule façon de sécuriser ses gains était de tout revendre contre de l'euro ou du dollar, de retirer l'argent sur son compte bancaire, puis de refaire un virement pour racheter plus tard. Un processus lent et coûteux.

### La révolution des Stablecoins

C'est là qu'interviennent les **Stablecoins** (littéralement : pièces stables). 

Un stablecoin est une cryptomonnaie dont la valeur est arrimée (indexée) à celle d'une monnaie fiduciaire, le plus souvent le **Dollar Américain (USD)**.

> 1 USDC = Toujours 1 Dollar.

C'est l'équivalent numérique d'un billet de banque traditionnel, mais qui circule sur la blockchain à la vitesse de la lumière.

### Les deux leaders du marché : USDT et USDC

1. **USDT (Tether) :** C'est le plus ancien et le plus utilisé dans le monde. Il est très liquide et disponible sur absolument toutes les plateformes.
2. **USDC (Circle) :** C'est le stablecoin réputé comme étant le plus transparent et le plus régulé. Il est audité mensuellement par de grands cabinets comptables pour prouver que pour chaque USDC créé numériquement, il y a bien un vrai dollar stocké en banque.

### À quoi ça sert concrètement ?

* **Se protéger des baisses :** Si vous sentez que le Bitcoin va baisser, vous l'échangez contre de l'USDC. Votre portefeuille ne bougera plus, peu importe la chute du Bitcoin.
* **Garder du pouvoir d'achat sous la main :** Avoir une réserve d'USDC permet de pouvoir racheter instantanément de la crypto lors d'une chute brutale du marché, sans attendre le délai d'un virement bancaire.
* **Faire des paiements internationaux :** Envoyer 1000 USDC à l'autre bout du monde prend 5 secondes et coûte une fraction de centime (notamment via le réseau Solana).

Sur **Remedly**, nous intégrons nativement l'USDC pour vous permettre de sécuriser facilement votre capital !
    `
  },
  {
    slug: 'comment-declarer-ses-cryptos-impots',
    title: "Comment déclarer ses cryptos aux impôts en France (Guide simplifié)",
    excerpt: "Plus-values, flat tax, formulaires... Tout ce qu'il faut savoir pour être en règle avec le fisc français sans s'arracher les cheveux.",
    category: 'Crypto',
    date: '18 Juillet 2026',
    readTime: '6 min',
    content: `
## L'impôt sur les cryptos : la règle d'or

La fiscalité des cryptomonnaies en France peut faire peur, mais elle repose en réalité sur un principe très simple :

> **Vous n'êtes imposé QUE lorsque vous convertissez vos cryptos en monnaie traditionnelle (Euros, Dollars...).**

Tant que votre argent reste dans l'écosystème crypto, vous ne payez pas d'impôts sur les plus-values. 

Par exemple, si vous échangez du Bitcoin contre de l'Ethereum, ou du Solana contre un Stablecoin (USDC), ce n'est **pas** un événement imposable. C'est l'un des plus grands avantages de la crypto !

### La fameuse Flat Tax de 30%

Lorsque vous décidez de revendre vos cryptomonnaies contre des euros et que vous réalisez un bénéfice global, cette plus-value est soumise au Prélèvement Forfaitaire Unique (PFU), plus connu sous le nom de **Flat Tax**.

Le taux est de **30%**, réparti ainsi :
* 12,8 % d'impôt sur le revenu
* 17,2 % de prélèvements sociaux

*Attention : l'impôt ne s'applique que sur la partie "bénéfice" de votre retrait, pas sur le capital initial.* 

*Bon à savoir : Les ventes totales inférieures à 305€ sur une année civile sont exonérées d'impôts !*

### Les déclarations obligatoires

En France, vous avez deux obligations principales lors de votre déclaration de revenus annuelle (au printemps) :

1. **Déclarer vos comptes ouverts à l'étranger (Formulaire 3916-bis) :** Si vous utilisez des plateformes d'échange dont le siège est situé hors de France (Binance, Kraken, Coinbase...), vous devez le signaler. Sur Remedly, la conservation étant en France/Europe et non-custodial via Privy, l'impact déclaratif est grandement simplifié.
2. **Déclarer vos plus-values ou moins-values (Formulaire 2086) :** Si vous avez converti des cryptos en euros dans l'année, vous devez remplir ce formulaire annexe pour détailler les calculs. Le montant net reporté sera ensuite inscrit sur le formulaire classique (2042 C).

### Les outils pour se simplifier la vie

Calculer soi-même la plus-value globale selon la formule fiscale complexe de l'État français est un véritable casse-tête si vous avez fait beaucoup de transactions.

Heureusement, il existe aujourd'hui des entreprises françaises spécialisées (comme *Waltio* ou *Koinly*) qui se connectent à vos portefeuilles et génèrent automatiquement votre liasse fiscale pré-remplie en quelques minutes.

*Avertissement : Les règles fiscales peuvent évoluer. Ce guide est à but éducatif et ne remplace pas les conseils d'un professionnel de la fiscalité ou d'un expert-comptable.* 
    `
  },
  {
    slug: 'comment-acheter-bitcoin-france',
    title: "Comment acheter du Bitcoin en France en 2026 : Le Guide",
    excerpt: "Découvrez comment investir dans le Bitcoin en toute sécurité, les étapes à suivre, et la différence entre carte bancaire et virement.",
    category: 'Débutant',
    date: '19 Juillet 2026',
    readTime: '5 min',
    content: `
## Pourquoi acheter en France en 2026 ?

Acheter du Bitcoin en France n'a jamais été aussi simple et sécurisé qu'aujourd'hui. Fini l'époque des plateformes obscures situées dans des paradis fiscaux. Le cadre légal européen (avec la réglementation MiCA) et français (PSAN) apporte aujourd'hui de vraies garanties de sécurité aux investisseurs.

Investir via une plateforme régulée et transparente est le premier pas indispensable pour protéger son capital.

### Les 4 étapes pour acheter (le parcours Remedly)

L'achat est devenu aussi facile qu'un achat sur une boutique en ligne classique. Voici comment se déroule le parcours :

1. **Choisir sa crypto et le montant :** Vous sélectionnez le Bitcoin (ou Solana, Ethereum) et indiquez le montant en euros (à partir de 30€ seulement).
2. **S'identifier :** Vous renseignez votre e-mail. C'est tout. Un portefeuille (wallet) hautement sécurisé est créé automatiquement pour vous, sans mot de passe complexe à retenir.
3. **Payer :** Vous choisissez votre méthode de paiement (Virement SEPA ou Carte Bancaire/Apple Pay).
4. **Recevoir :** Vos cryptos arrivent directement dans votre portefeuille privé. Vous en êtes le seul et unique propriétaire.

### Carte Bancaire vs Virement SEPA : Que choisir ?

Lorsque vous achetez de la cryptomonnaie, les frais dépendent grandement du moyen de paiement choisi :

* **La Carte Bancaire (ou Apple Pay) :** C'est la méthode la plus rapide. L'achat est *instantané*. C'est idéal si le marché s'effondre et que vous souhaitez acheter immédiatement à un bon prix. En contrepartie, les frais liés au réseau bancaire (Visa/Mastercard) sont plus élevés.
* **Le Virement SEPA :** C'est la méthode recommandée pour les achats réguliers ou les gros montants. Les frais sont très transparents et considérablement réduits. Le seul inconvénient est le délai bancaire : cela peut prendre de 1 à 3 jours ouvrés selon votre banque.

### Le mot de la fin

Il n'y a pas besoin d'être un expert en informatique pour commencer à investir. Sur Remedly, vous bénéficiez du parcours le plus fluide du marché, avec des frais transparents et une création de wallet invisible.

[Démarrez votre premier achat de Bitcoin dès maintenant !](/acheter)
    `
  },
  {
    slug: 'perte-acces-compte-wallet',
    title: "Perdre l'accès à son compte crypto : comment ça marche ?",
    excerpt: "C'est la plus grande peur des débutants : que se passe-t-il si je perds mon mot de passe ou mon téléphone ? Faisons le point.",
    category: 'Sécurité',
    date: '20 Juillet 2026',
    readTime: '4 min',
    content: `
## La peur de tout perdre

C'est une histoire que l'on entend souvent : "Un homme cherche un vieux disque dur dans une décharge contenant des millions d'euros en Bitcoin". 

La plus grande angoisse des débutants n'est souvent pas la volatilité du marché, mais la peur de perdre l'accès à son compte ou de faire une erreur de manipulation fatale.

### Le problème des wallets classiques

Historiquement, lorsque vous créez un vrai portefeuille crypto décentralisé (Metamask, Ledger), le logiciel vous fournit une **Seed Phrase** : une suite de 12 à 24 mots anglais. 

Cette phrase est votre unique clé d'accès. Si vous perdez votre ordinateur, vous pouvez restaurer vos fonds grâce à ces 24 mots. 
**Mais si vous perdez ce bout de papier contenant les 24 mots, vos fonds sont perdus à tout jamais.** Il n'y a pas de service client à appeler. C'est le prix de la décentralisation totale.

### L'approche innovante de Remedly

Chez Remedly, nous pensons que la sécurité ne doit pas se faire au détriment de la simplicité. C'est pourquoi nous utilisons la technologie des *Embedded Wallets*.

**Comment récupérer mon compte si je change de téléphone ?**
Votre compte est lié à votre adresse e-mail ou compte Google. Il n'y a aucune 'phrase de récupération' (seed phrase) complexe à mémoriser. Il vous suffit de vous reconnecter avec le même e-mail.

Vous gardez le contrôle total de vos fonds (non-custodial), mais l'accès est sécurisé de manière transparente.

### Les limites à connaître (Soyons honnêtes)

Cette simplicité repose sur un pilier : la sécurité de votre boîte mail. 

Si vous perdez l'accès à votre adresse e-mail principale (et que vous ne pouvez pas la récupérer via les procédures normales de Gmail, Outlook, etc.), vous risquez de perdre l'accès à votre compte crypto associé. 
C'est pourquoi nous recommandons toujours d'activer la double authentification (2FA) sur votre boîte mail principale.

Sur Remedly, nous avons éliminé le stress des 24 mots pour que vous puissiez investir sereinement.
    `
  },
  {
    slug: 'lexique-crypto-20-termes',
    title: "Le lexique crypto pour débutant : 20 termes à connaître",
    excerpt: "Bull run, Halving, Seed Phrase... Décryptez le jargon souvent opaque de l'écosystème crypto avec ce dictionnaire simplifié.",
    category: 'Débutant',
    date: '21 Juillet 2026',
    readTime: '6 min',
    content: `
## Décoder le jargon crypto

L'écosystème Web3 possède son propre langage, souvent composé d'acronymes anglais. Voici 20 termes expliqués simplement pour ne plus vous sentir perdu.

### A à E

* **Adresse publique :** C'est l'équivalent de votre RIB (IBAN). Vous pouvez la partager publiquement pour que l'on vous envoie des cryptos.
* **Altcoin (Alternative Coin) :** Désigne toutes les cryptomonnaies autres que le Bitcoin (Ethereum, Solana, Ripple...).
* **Blockchain :** Un registre numérique public, sécurisé et décentralisé, qui enregistre toutes les transactions (le grand livre de comptes).
* **CEX (Centralized Exchange) :** Une plateforme d'échange gérée par une entreprise (ex: Binance, Coinbase).
* **Cold Wallet :** Un portefeuille "froid" physique (comme une clé USB) non connecté à internet pour stocker ses cryptos de manière très sécurisée.
* **DEX (Decentralized Exchange) :** Une bourse d'échange décentralisée, fonctionnant sans entreprise derrière, gérée uniquement par du code (Smart Contracts).
* **DeFi (Decentralized Finance) :** La finance décentralisée, permettant d'emprunter, prêter ou échanger des actifs sans banque.

### F à M

* **FOMO (Fear Of Missing Out) :** La peur de rater une opportunité. C'est l'émotion qui pousse souvent les débutants à acheter quand les prix sont déjà très hauts.
* **Frais de réseau (Gas Fee) :** Les frais payés aux validateurs/mineurs pour inscrire votre transaction sur la blockchain.
* **Halving :** Un événement automatique (tous les 4 ans sur Bitcoin) qui divise par deux la création de nouvelles pièces, augmentant ainsi sa rareté.
* **HODL :** Une faute de frappe historique du mot "Hold" (Garder) devenue un mème. Signifie "conserver ses cryptos à long terme, peu importe les baisses".
* **Hot Wallet :** Un portefeuille logiciel connecté à internet (ex: une extension de navigateur ou une application mobile).
* **Layer 1 / Layer 2 :** Un Layer 1 (Couche 1) est une blockchain principale (Bitcoin, Ethereum). Un Layer 2 est un réseau secondaire construit par-dessus pour la rendre plus rapide et moins chère.
* **Market Cap (Capitalisation boursière) :** La valeur totale de toutes les pièces en circulation d'une cryptomonnaie (Prix d'une pièce multiplié par le nombre de pièces).

### N à S

* **NFT (Non-Fungible Token) :** Un jeton numérique unique représentant la propriété d'un actif (art, musique, objet dans un jeu).
* **Seed Phrase (Phrase de récupération) :** Une suite de 12 à 24 mots générée lors de la création d'un portefeuille crypto classique. C'est le mot de passe ultime.
* **Stablecoin :** Une cryptomonnaie conçue pour conserver une valeur stable, souvent indexée au dollar. (Pour aller plus loin, lisez notre article : [Comprendre les stablecoins](/apprendre/comprendre-les-stablecoins)).
* **Staking :** Le fait de bloquer ses cryptomonnaies pour aider à sécuriser le réseau en échange de récompenses (des intérêts).

### T à W

* **Token (Jeton) :** Un actif numérique émis sur une blockchain existante (contrairement à un "Coin" qui a sa propre blockchain, comme le Bitcoin).
* **Volatilité :** L'ampleur des variations de prix d'un actif. Les cryptomonnaies sont très volatiles (leurs prix montent et baissent rapidement).
* **Wallet (Portefeuille) :** Un logiciel ou appareil matériel permettant de stocker vos clés privées et d'interagir avec la blockchain.
* **Wallet non-custodial :** Un portefeuille où vous êtes le seul à détenir les clés privées. Vous seul avez accès à vos fonds (comme sur Remedly).
* **Whale (Baleine) :** Une personne ou entité qui possède une quantité massive d'une cryptomonnaie, capable d'influencer le prix du marché.

Sur Remedly, nous simplifions tout ce jargon en créant votre portefeuille non-custodial automatiquement, sans Seed Phrase !
    `
  },
  {
    slug: 'qu-est-ce-qu-un-wallet-non-custodial',
    title: "Qu'est-ce qu'un wallet non-custodial ?",
    excerpt: "Comprendre la différence entre détenir réellement ses cryptos (non-custodial) et faire confiance à un tiers (custodial).",
    category: 'Sécurité',
    date: '22 Juillet 2026',
    readTime: '4 min',
    content: `
## Custodial vs Non-Custodial : La grande différence

Dans le monde de la cryptomonnaie, la façon dont vous stockez vos actifs est aussi importante que les actifs eux-mêmes. Il existe deux grandes familles de portefeuilles (wallets) : les **custodial** et les **non-custodial**.

### 1. Le Wallet Custodial (Hébergé)

C'est le modèle le plus courant pour les débutants qui s'inscrivent sur de grandes plateformes d'échange centralisées (Binance, Coinbase, Kraken).
Dans ce modèle, **la plateforme agit comme une banque**. Elle détient vos clés privées et garde vos fonds en votre nom. 

* **Avantage :** C'est très simple. Si vous perdez votre mot de passe, un clic sur "Mot de passe oublié" suffit.
* **Inconvénient (et danger) :** Vous ne possédez pas vraiment vos cryptos. Si la plateforme fait faillite (comme FTX), se fait pirater, ou décide de geler votre compte, vous perdez tout accès à votre argent.

### 2. Le Wallet Non-Custodial (Non-Hébergé)

C'est l'essence même de la cryptomonnaie : être son propre banquier. 
Avec un wallet non-custodial (comme Metamask, Ledger, ou le wallet intégré de Remedly), **vous êtes le seul détenteur de vos clés privées**.

* **Avantage :** Personne ne peut geler vos fonds ou vous empêcher d'y accéder. La sécurité est totale tant que vous protégez vos accès.
* **Inconvénient traditionnel :** La gestion de la "Seed Phrase" (les 12 ou 24 mots). Si vous la perdez, vos fonds sont perdus à jamais. 

### La solution Remedly : Le meilleur des deux mondes

Historiquement, le non-custodial était réservé aux utilisateurs techniques, car la gestion de la Seed Phrase était source de stress et de pertes (voir notre article [Perdre l'accès à son compte crypto](/apprendre/perte-acces-compte-wallet)).

Chez **Remedly**, nous utilisons la technologie des *Embedded Wallets* fournis par Privy. 
* Votre portefeuille est **strictement non-custodial** : Remedly n'a aucun accès à vos fonds.
* **Aucune Seed Phrase** à stocker : la clé cryptographique est fractionnée et liée de manière sécurisée à votre adresse e-mail. 

Vous bénéficiez ainsi de la sécurité absolue du "non-custodial", avec la simplicité d'utilisation d'une application classique.
    `
  },
  {
    slug: 'usdc-le-stablecoin-explique',
    title: "USDC : à quoi sert un stablecoin adossé au dollar ?",
    excerpt: "Le prix du Bitcoin bouge tous les jours. Découvrez l'USDC, une cryptomonnaie pensée pour rester stable, et à quoi elle peut vous servir.",
    category: 'Crypto',
    date: '23 Juillet 2026',
    readTime: '3 min',
    content: `
## Une cryptomonnaie qui ne bouge (presque) pas

La plupart des cryptomonnaies sont connues pour leur volatilité : le prix du Bitcoin ou de l'Ethereum peut varier de plusieurs pourcents en quelques heures. L'**USDC (USD Coin)** répond à un besoin différent : rester stable.

Un USDC vaut, en théorie, toujours 1 dollar américain. C'est ce qu'on appelle un **stablecoin**. Concrètement, chaque USDC en circulation est censé être garanti par un dollar (ou un actif équivalent) détenu en réserve par son émetteur, Circle.

### À quoi ça sert concrètement ?

* **Se mettre à l'abri de la volatilité** : si vous pensez que le marché va baisser, convertir une partie de vos cryptos en USDC permet de "sortir" temporairement de la volatilité sans repasser par un virement bancaire classique.
* **Un point de repère stable** : beaucoup de plateformes utilisent l'USDC comme unité de compte de référence dans l'écosystème crypto.

### Les points de vigilance

Un stablecoin n'est stable que si les réserves qui le soutiennent sont réelles et bien gérées — c'est le rôle de l'émetteur, pas de la blockchain elle-même. Ce n'est pas un placement censé rapporter un rendement : sa vocation est justement de ne pas bouger.

Sur Remedly, l'USDC s'achète comme n'importe quelle autre cryptomonnaie, avec votre portefeuille non-custodial habituel.
    `
  },
  {
    slug: 'avalanche-avax-explication',
    title: "Avalanche (AVAX) : une blockchain pensée pour la vitesse",
    excerpt: "Transactions rapides, frais réduits : découvrez ce qui différencie Avalanche des autres blockchains, en langage simple.",
    category: 'Crypto',
    date: '24 Juillet 2026',
    readTime: '3 min',
    content: `
## Le problème qu'Avalanche essaie de résoudre

Les blockchains historiques comme Bitcoin ou Ethereum ont un point commun : plus il y a de monde qui les utilise, plus les transactions peuvent devenir lentes et coûteuses. **Avalanche** est un réseau conçu pour traiter un grand nombre de transactions rapidement, avec des frais généralement plus bas.

### Comment ça fonctionne, sans le jargon

Avalanche utilise un mécanisme de validation différent de celui du Bitcoin (qui repose sur le minage). Plusieurs petits groupes de validateurs se mettent d'accord en parallèle, ce qui permet au réseau de confirmer les transactions en quelques secondes plutôt qu'en plusieurs minutes.

Son jeton natif, l'**AVAX**, sert à payer les frais de transaction sur le réseau et à participer à sa sécurisation.

### Pourquoi les investisseurs s'y intéressent

Avalanche héberge de nombreuses applications décentralisées (finance, jeux, NFT) qui ont besoin de rapidité et de coûts prévisibles. Comme pour toute cryptomonnaie, sa valeur dépend de l'adoption réelle du réseau — ce n'est pas une garantie de performance future.

Sur Remedly, AVAX s'achète directement avec votre portefeuille non-custodial habituel, sans configuration technique supplémentaire.
    `
  },
  {
    slug: 'chainlink-link-oracles-explication',
    title: "Chainlink (LINK) : à quoi servent les oracles blockchain ?",
    excerpt: "Une blockchain ne peut pas consulter internet toute seule. Découvrez comment Chainlink lui apporte des données du monde réel.",
    category: 'Crypto',
    date: '25 Juillet 2026',
    readTime: '3 min',
    content: `
## Le problème que Chainlink résout

Une blockchain fonctionne en vase clos : elle ne peut pas, par elle-même, aller consulter le cours d'une action, la météo ou le résultat d'un match de foot sur internet. Pourtant, de nombreuses applications décentralisées ont besoin de ces informations pour fonctionner (par exemple, connaître le prix réel d'une cryptomonnaie).

C'est le rôle d'un **oracle** : un service qui va chercher une donnée à l'extérieur de la blockchain et la lui transmet de façon fiable. **Chainlink** est le réseau d'oracles le plus utilisé de l'écosystème.

### Comment ça fonctionne, sans le jargon

Plutôt que de faire confiance à une seule source d'information (qui pourrait être fausse ou piratée), Chainlink interroge plusieurs sources indépendantes et compare leurs réponses avant de les transmettre à la blockchain. Le jeton **LINK** sert à rémunérer les opérateurs qui font tourner ce réseau d'oracles.

### Pourquoi c'est important

Sans oracles fiables, une grande partie de la finance décentralisée (DeFi) ne pourrait tout simplement pas fonctionner correctement. Chainlink est aujourd'hui utilisé par un grand nombre de projets pour cette brique technique.

Sur Remedly, LINK s'achète comme les autres cryptomonnaies disponibles, avec votre portefeuille non-custodial habituel.
    `
  },
  {
    slug: 'polygon-pol-explication',
    title: "Polygon (POL) : pourquoi Ethereum a besoin d'un coup de pouce",
    excerpt: "Ethereum peut être lent et coûteux aux heures de forte affluence. Découvrez comment Polygon (anciennement MATIC) l'aide à passer à l'échelle.",
    category: 'Crypto',
    date: '26 Juillet 2026',
    readTime: '3 min',
    content: `
## Le problème que Polygon résout

Ethereum est l'une des blockchains les plus utilisées au monde, mais son succès a un revers : quand le réseau est très sollicité, les frais de transaction ("gas") peuvent grimper et les confirmations ralentir. **Polygon** est un réseau construit pour fonctionner à côté d'Ethereum et lui apporter davantage de rapidité, avec des frais nettement plus bas.

### Comment ça fonctionne, sans le jargon

Polygon traite les transactions sur son propre réseau, puis vient régulièrement ancrer un résumé de son activité sur la blockchain Ethereum, ce qui lui permet de bénéficier indirectement de sa sécurité tout en restant rapide et peu coûteux au quotidien.

### Le changement de nom : de MATIC à POL

Le jeton du réseau s'appelait historiquement **MATIC**. Depuis 2024, le projet Polygon a fait migrer son jeton vers un nouveau nom, **POL**, dans le cadre de l'évolution de son architecture technique. Sur Remedly, c'est ce nouveau jeton (POL) qui est proposé à l'achat.

### Pourquoi les investisseurs s'y intéressent

De nombreuses applications (jeux, paiements, NFT) choisissent Polygon pour éviter les frais élevés d'Ethereum. Comme pour tout actif, sa valeur dépend de l'adoption réelle du réseau dans la durée.

Sur Remedly, POL s'achète directement avec votre portefeuille non-custodial habituel.
    `
  },
  {
    slug: 'shiba-inu-shib-comprendre-les-risques',
    title: "Shiba Inu (SHIB) : comprendre un memecoin avant d'y toucher",
    excerpt: "SHIB est l'un des memecoins les plus connus du marché. Avant d'y investir un euro, voici ce qu'il faut absolument comprendre.",
    category: 'Crypto',
    date: '27 Juillet 2026',
    readTime: '3 min',
    content: `
## Qu'est-ce qu'un "memecoin" ?

Un **memecoin** est une cryptomonnaie née d'une blague ou d'un phénomène internet plutôt que d'un projet technique avec une utilité précise. **Shiba Inu (SHIB)**, lancé en 2020 en clin d'œil au Dogecoin, en est l'un des exemples les plus connus.

Contrairement à Chainlink ou Polygon, SHIB n'a pas vocation à résoudre un problème technique particulier : sa valeur repose presque entièrement sur la popularité, la spéculation et l'engouement de sa communauté.

### Ce qu'il faut absolument savoir avant d'en acheter

* **Une volatilité extrême** : les memecoins peuvent gagner ou perdre une grande partie de leur valeur en très peu de temps, bien plus brutalement que Bitcoin ou Ethereum.
* **Pas de "valeur refuge"** : à la différence d'un stablecoin comme l'USDC, rien ne garantit un prix plancher.
* **Ce n'est pas un investissement de long terme classique** : c'est un actif spéculatif, à traiter comme tel — n'y mettez que ce que vous êtes prêt à perdre.

### Notre position chez Remedly

Nous rendons SHIB accessible à l'achat comme les autres cryptomonnaies de notre offre, mais nous ne donnons aucun conseil en investissement (voir nos [mentions légales](/mentions-legales)) et tenons à être transparents : SHIB est, par nature, l'un des actifs les plus risqués de notre plateforme.
    `
  },
  {
    slug: 'uniswap-uni-echange-decentralise',
    title: "Uniswap (UNI) : comment fonctionne un échange sans intermédiaire ?",
    excerpt: "Pas de banque, pas de courtier : découvrez comment Uniswap permet d'échanger des cryptomonnaies directement entre utilisateurs.",
    category: 'Crypto',
    date: '28 Juillet 2026',
    readTime: '3 min',
    content: `
## Un échange sans intermédiaire central

Sur une plateforme d'échange classique (comme un exchange centralisé), c'est l'entreprise elle-même qui met en relation acheteurs et vendeurs, un peu comme une bourse traditionnelle. **Uniswap** fonctionne différemment : c'est un protocole décentralisé qui permet aux utilisateurs d'échanger des cryptomonnaies directement entre eux, sans société intermédiaire pour tenir le carnet d'ordres.

### Comment ça fonctionne, sans le jargon

Au lieu d'un carnet d'ordres classique, Uniswap repose sur des "réserves de liquidité" : des utilisateurs déposent une paire de cryptomonnaies dans un contrat automatisé, et ce contrat calcule lui-même les prix d'échange en fonction de l'offre et de la demande. Le jeton **UNI** sert notamment à la gouvernance du protocole : ses détenteurs peuvent voter sur les évolutions futures d'Uniswap.

### Pourquoi c'est important dans l'écosystème crypto

Uniswap est l'un des protocoles d'échange décentralisé (DEX) les plus utilisés au monde, et un pilier historique de la finance décentralisée (DeFi).

**À noter** : Remedly ne fait pas d'échange (swap) de cryptomonnaies pour le compte de ses utilisateurs — nous vous proposons uniquement d'acheter le jeton UNI par carte bancaire ou virement, comme n'importe quel autre actif de notre offre.
    `
  }
];
