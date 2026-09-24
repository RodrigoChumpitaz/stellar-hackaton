import { getSupabase } from "@/lib/supabase";
import type { Tables } from "@/types/database.types";
import { StellarAddressSchema } from "./schemas";

export type CatalogCard = Tables<"cards_catalog">;
export type UserCard = Tables<"user_cards">;
export type ForgeRecord = Tables<"forge_history">;

export async function getCatalog(): Promise<CatalogCard[]> {
  const { data, error } = await getSupabase().from("cards_catalog").select("*").order("id");
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return data;
}

/** Inventario vivo (no quemado) de un jugador, más recientes primero. */
export async function getUserCards(playerAddress: string): Promise<UserCard[]> {
  const address = StellarAddressSchema.parse(playerAddress);
  const { data, error } = await getSupabase()
    .from("user_cards")
    .select("*")
    .eq("player_address", address)
    .eq("is_burned", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudo leer el inventario: ${error.message}`);
  return data;
}

export async function getForgeHistory(playerAddress: string, limit = 20): Promise<ForgeRecord[]> {
  const address = StellarAddressSchema.parse(playerAddress);
  const { data, error } = await getSupabase()
    .from("forge_history")
    .select("*")
    .eq("player_address", address)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`No se pudo leer el historial de forjas: ${error.message}`);
  return data;
}
