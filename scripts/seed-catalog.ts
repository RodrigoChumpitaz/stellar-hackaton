// Pobla cards_catalog con las cartas base. Idempotente (upsert por nombre).
// Uso: npm run db:seed   (lee .env.local)

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { BASE_CATALOG } from "../src/modules/cards/domain/catalog";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await supabase
    .from("cards_catalog")
    .upsert([...BASE_CATALOG], { onConflict: "name" })
    .select("id, name, element");

  if (error) {
    console.error("Error al sembrar el catálogo:", error.message);
    process.exit(1);
  }
  console.table(data);
}

main();
