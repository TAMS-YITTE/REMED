// Seed ReMed avec ~30 annonces réalistes
// Run: node seed.cjs

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const ANNONCES = [
  // Dentisterie
  { titre: "Fauteuil dentaire Adec 311 - excellent état", categorie: "Dentisterie", etat: "Très bon état", prix: 8500, marque: "Adec", modele: "311", annee: 2019, desc: "Fauteuil dentaire Adec 311 acheté neuf en 2019, utilisé en cabinet pendant 4 ans. Très peu d'usure, parfaitement entretenu. Démontable et livrable sur toute la France. Cause vente : départ en retraite." },
  { titre: "Autoclave Melag Vacuklav 41 B+", categorie: "Dentisterie", etat: "Bon état", prix: 2200, marque: "Melag", modele: "Vacuklav 41 B+", annee: 2017, desc: "Autoclave classe B, capacité 17L. Toutes les maintenances à jour, factures disponibles." },
  { titre: "Radio panoramique Planmeca ProMax 2D", categorie: "Dentisterie", etat: "Très bon état", prix: 11000, marque: "Planmeca", modele: "ProMax 2D", annee: 2020, desc: "Panoramique numérique avec ordinateur dédié et logiciel Romexis inclus. Faible utilisation." },

  // Kinésithérapie
  { titre: "Table de massage électrique Chattanooga", categorie: "Kinésithérapie & Rééducation", etat: "Très bon état", prix: 1800, marque: "Chattanooga", modele: "Triton DTS", annee: 2021, desc: "Table de massage 3 plans, hauteur électrique. Idéale pour rééducation et ostéopathie." },
  { titre: "Vélo ergomètre Monark 828E", categorie: "Kinésithérapie & Rééducation", etat: "Bon état", prix: 750, marque: "Monark", modele: "828E", annee: 2018, desc: "Vélo ergomètre à frein mécanique. Robuste, peu utilisé." },
  { titre: "Appareil d'électrothérapie Compex Theta", categorie: "Kinésithérapie & Rééducation", etat: "Très bon état", prix: 1200, marque: "Compex", modele: "Theta 500", annee: 2022, desc: "Stimulation électrique 4 canaux, multiples programmes. Avec tous les accessoires." },
  { titre: "Tapis de course médical h/p/cosmos", categorie: "Kinésithérapie & Rééducation", etat: "Bon état", prix: 4500, marque: "h/p/cosmos", modele: "Mercury", annee: 2016, desc: "Tapis de course professionnel pour rééducation. Plage de vitesse 0-25 km/h, inclinaison 0-25%." },

  // Imagerie
  { titre: "Échographe Mindray DC-70 - 3 sondes", categorie: "Imagerie & Radiologie", etat: "Très bon état", prix: 18000, marque: "Mindray", modele: "DC-70", annee: 2020, desc: "Échographe couleur multi-applications avec 3 sondes (convexe, linéaire, endocavitaire). Très peu d'heures." },
  { titre: "Échographe portable GE Vscan", categorie: "Imagerie & Radiologie", etat: "Bon état", prix: 3200, marque: "GE", modele: "Vscan Air", annee: 2019, desc: "Échographe portable de poche, idéal pour consultations à domicile." },
  { titre: "Mammographe Hologic Selenia", categorie: "Imagerie & Radiologie", etat: "Bon état", prix: 32000, marque: "Hologic", modele: "Selenia Dimensions", annee: 2015, desc: "Mammographe numérique full-field. Maintenance constructeur à jour." },

  // Consultation
  { titre: "Tensiomètre électronique Omron M7", categorie: "Consultation & Diagnostic", etat: "Neuf (jamais utilisé)", prix: 95, marque: "Omron", modele: "M7 Intelli IT", annee: 2024, desc: "Tensiomètre brassard validé cliniquement. Encore sous emballage." },
  { titre: "Otoscope Heine Beta 400", categorie: "Consultation & Diagnostic", etat: "Très bon état", prix: 380, marque: "Heine", modele: "Beta 400 LED", annee: 2022, desc: "Otoscope LED avec mallette de transport et 10 spéculums." },
  { titre: "Spiromètre MIR Spirobank II", categorie: "Consultation & Diagnostic", etat: "Bon état", prix: 650, marque: "MIR", modele: "Spirobank II Advanced", annee: 2020, desc: "Spiromètre portable avec logiciel d'analyse inclus." },
  { titre: "ECG Schiller AT-2 plus", categorie: "Consultation & Diagnostic", etat: "Bon état", prix: 1900, marque: "Schiller", modele: "AT-2 plus", annee: 2017, desc: "Électrocardiographe 12 dérivations avec interprétation automatique." },

  // Ophtalmologie
  { titre: "Lampe à fente Haag-Streit BQ 900", categorie: "Ophtalmologie", etat: "Très bon état", prix: 14000, marque: "Haag-Streit", modele: "BQ 900", annee: 2018, desc: "Lampe à fente de référence, optique parfaite. Cause vente : changement de matériel." },
  { titre: "Tonomètre Reichert 7CR", categorie: "Ophtalmologie", etat: "Bon état", prix: 6500, marque: "Reichert", modele: "7CR", annee: 2019, desc: "Tonomètre à air corneal-compensated. Idéal pour mesure pression intraoculaire." },
  { titre: "Réfractomètre Topcon KR-1", categorie: "Ophtalmologie", etat: "Bon état", prix: 8200, marque: "Topcon", modele: "KR-1", annee: 2016, desc: "Réfractomètre auto-kératomètre, peu utilisé." },

  // Cardiologie
  { titre: "Holter ECG GE SEER 1000", categorie: "Cardiologie", etat: "Très bon état", prix: 2800, marque: "GE", modele: "SEER 1000", annee: 2021, desc: "Holter ECG 12 dérivations avec logiciel d'analyse." },
  { titre: "Défibrillateur Philips HeartStart FRx", categorie: "Cardiologie", etat: "Neuf (jamais utilisé)", prix: 1450, marque: "Philips", modele: "HeartStart FRx", annee: 2024, desc: "Défibrillateur automatique externe. Encore sous garantie constructeur." },

  // Chirurgie
  { titre: "Bistouri électrique Erbe VIO 200 D", categorie: "Chirurgie & Bloc", etat: "Bon état", prix: 3500, marque: "Erbe", modele: "VIO 200 D", annee: 2018, desc: "Générateur électrochirurgical haute fréquence. Toutes options activées." },
  { titre: "Table d'opération Maquet Alphamaxx", categorie: "Chirurgie & Bloc", etat: "Bon état", prix: 18000, marque: "Maquet", modele: "Alphamaxx 1133", annee: 2014, desc: "Table d'opération hydraulique. Toutes les positions fonctionnelles." },

  // Mobilier
  { titre: "Lot de 3 fauteuils salle d'attente design", categorie: "Mobilier médical", etat: "Très bon état", prix: 280, marque: "VIK", annee: 2022, desc: "3 fauteuils de salle d'attente, simili-cuir gris. Comme neufs." },
  { titre: "Table d'examen électrique Lemi", categorie: "Mobilier médical", etat: "Bon état", prix: 1100, marque: "Lemi", modele: "EM 6105", annee: 2019, desc: "Table d'examen 5 plans, hauteur électrique, papier rouleau intégré." },
  { titre: "Bureau médical complet en chêne", categorie: "Mobilier médical", etat: "Bon état", prix: 650, marque: "", annee: 2017, desc: "Bureau, caisson 3 tiroirs et bibliothèque assortie. Bon état général." },
  { titre: "Négatoscope LED 2 plages", categorie: "Mobilier médical", etat: "Très bon état", prix: 220, marque: "Schreiber", annee: 2020, desc: "Négatoscope LED double pour lecture radio." },

  // Stérilisation
  { titre: "Bac à ultrasons Bandelin Sonorex 5L", categorie: "Stérilisation", etat: "Très bon état", prix: 480, marque: "Bandelin", modele: "Sonorex Digitec", annee: 2021, desc: "Bac à ultrasons 5L avec couvercle et panier inox." },
  { titre: "Soudeuse de sachets HM 3000", categorie: "Stérilisation", etat: "Bon état", prix: 320, marque: "HM Sachets", modele: "3000", annee: 2018, desc: "Soudeuse rotative pour sachets de stérilisation, largeur 12mm." },

  // Dermatologie
  { titre: "Cryothérapie azote liquide CryoPro", categorie: "Autre", etat: "Bon état", prix: 580, marque: "CryoPro", annee: 2019, desc: "Système de cryothérapie pour dermatologie, capacité 500ml." },
  { titre: "Lampe Wood diagnostic Heine", categorie: "Autre", etat: "Très bon état", prix: 290, marque: "Heine", annee: 2022, desc: "Lampe de Wood UV pour diagnostic dermatologique." },

  // Divers
  { titre: "Lot complet matériel cabinet médecin généraliste", categorie: "Consultation & Diagnostic", etat: "Bon état", prix: 4500, annee: 2018, desc: "Vente complète suite à cessation d'activité : tensiomètre, otoscope, ophtalmoscope, ECG, table d'examen, bureau, fauteuils, négatoscope. Tout en très bon état." },
];

const VILLES = [
  { ville: "Paris", region: "Île-de-France" },
  { ville: "Lyon", region: "Auvergne-Rhône-Alpes" },
  { ville: "Marseille", region: "Provence-Alpes-Côte d'Azur" },
  { ville: "Toulouse", region: "Occitanie" },
  { ville: "Bordeaux", region: "Nouvelle-Aquitaine" },
  { ville: "Strasbourg", region: "Grand Est" },
  { ville: "Lille", region: "Hauts-de-France" },
  { ville: "Rennes", region: "Bretagne" },
  { ville: "Nantes", region: "Pays de la Loire" },
  { ville: "Rouen", region: "Normandie" },
  { ville: "Dijon", region: "Bourgogne-Franche-Comté" },
  { ville: "Tours", region: "Centre-Val de Loire" },
  { ville: "Nice", region: "Provence-Alpes-Côte d'Azur" },
  { ville: "Grenoble", region: "Auvergne-Rhône-Alpes" },
  { ville: "Montpellier", region: "Occitanie" },
];

const NOMS_VENDEURS = ["Dr. Martin", "Dr. Bernard", "Dr. Dubois", "Dr. Petit", "Dr. Moreau", "Dr. Durand", "Dr. Leroy", "Dr. Simon", "Dr. Laurent", "Dr. Fournier"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  console.log("🌱 Seed ReMed — démarrage...");

  await db.from("annonces").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("   Tables vidées");

  // Créer 10 users vendeurs partagés
  const passwordHash = await bcrypt.hash("Seed12345!", 12);
  const users = NOMS_VENDEURS.map((nom, i) => {
    const [titre, n] = nom.split(" ");
    return {
      prenom: titre,
      nom: n,
      email: `vendeur${i + 1}@seed.remed.fr`,
      password_hash: passwordHash,
    };
  });

  const { data: insertedUsers, error: uErr } = await db.from("users").insert(users).select();
  if (uErr) { console.error("Erreur users:", uErr); return; }
  console.log(`   ✓ ${insertedUsers.length} vendeurs créés`);

  // Insert annonces
  const annonces = ANNONCES.map((a, i) => {
    const u = rand(insertedUsers);
    const lieu = rand(VILLES);
    return {
      user_id: u.id,
      titre: a.titre,
      description: a.desc,
      categorie: a.categorie,
      etat: a.etat,
      prix: a.prix,
      ville: lieu.ville,
      region: lieu.region,
      marque: a.marque || null,
      modele: a.modele || null,
      annee: a.annee,
      statut: "active",
      urgent: Math.random() < 0.15, // ~15% urgent
      contact_email: u.email,
      contact_tel: Math.random() > 0.5 ? `0${Math.floor(Math.random() * 5) + 1} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}` : null,
    };
  });

  const { data: insertedA, error: aErr } = await db.from("annonces").insert(annonces).select();
  if (aErr) { console.error("Erreur annonces:", aErr); return; }
  console.log(`   ✓ ${insertedA.length} annonces créées`);

  const { count: urgents } = await db.from("annonces").select("*", { count: "exact", head: true }).eq("urgent", true);
  console.log("\n✅ Seed terminé");
  console.log(`   Total annonces : ${insertedA.length}`);
  console.log(`   Urgentes : ${urgents}`);
}

seed().catch(console.error);
