import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Cliente público (publishable key). Solo lectura: RLS no permite escrituras.
// Seguro en el navegador y en el servidor. Los jugadores se identifican por wallet,
// no por Supabase Auth, así que no se persiste sesión.

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copia .env.example a .env.local.",
    );
  }

  client = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });
  return client;
}
