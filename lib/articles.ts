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
    slug: 'pourquoi-bitcoin',
    title: "Pourquoi Bitcoin ? Comprendre l'or numérique",
    excerpt: "Bitcoin est souvent qualifié d'or numérique, mais qu'est-ce qui donne réellement de la valeur à cette monnaie virtuelle ?",
    category: 'Crypto',
    date: '14 Juillet 2026',
    readTime: '3 min',
    content: `
## La rareté numérique, une première historique

Avant la création de Bitcoin en 2009 par l'anonyme Satoshi Nakamoto, tout ce qui était numérique pouvait être copié à l'infini. Une photo, un fichier mp3, un document texte... tout est duplicable par un simple "copier-coller".

Comment créer une monnaie numérique si on peut la copier à l'infini ? C'était le problème de la "double dépense", résolu brillamment par Bitcoin grâce à la blockchain.

Bitcoin a inventé **la rareté numérique**. 

### Qu'est-ce qui fait la valeur de Bitcoin ?

Contrairement à l'Euro ou au Dollar qui peuvent être imprimés à l'infini par les banques centrales (ce qui crée de l'inflation et fait baisser notre pouvoir d'achat), Bitcoin a des règles mathématiques strictes et immuables :

1. **Il n'y aura jamais plus de 21 millions de Bitcoins.** C'est inscrit dans le code, et personne ne peut le changer. Actuellement, plus de 19 millions ont déjà été créés.
2. **L'émission est divisée par deux tous les 4 ans.** C'est ce qu'on appelle le "Halving". La création de nouveaux Bitcoins devient de plus en plus difficile et lente avec le temps, renforçant sa rareté.
3. **Il n'a pas de chef.** Il n'y a pas de PDG de Bitcoin, pas d'entreprise derrière, pas de serveur central à éteindre. C'est un protocole mondial, entretenu par des dizaines de milliers d'ordinateurs. Personne ne peut le censurer ou l'arrêter.

### L'Or Numérique

Grâce à ces caractéristiques (rareté, incensurabilité, durabilité), Bitcoin est aujourd'hui considéré par de nombreux experts et institutions financières comme une réserve de valeur, au même titre que l'or physique. La grande différence ? Bitcoin est divisible en infimes fractions (les "Satoshis"), transportable sur un simple téléphone, et transférable à l'autre bout du monde en quelques minutes, de manière totalement indépendante du système bancaire traditionnel.
    `
  }
];
