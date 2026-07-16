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
  }
];
