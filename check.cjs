require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

(async () => {
  const { count, data, error } = await db.from("annonces").select("statut, titre", { count: "exact" });
  console.log("Total:", count);
  console.log("Erreur:", error?.message ?? "none");
  if (data) console.log("Statuts:", [...new Set(data.map(r => r.statut))]);
  console.log("3 premiers titres:", data?.slice(0, 3).map(r => `[${r.statut}] ${r.titre}`));
})();
