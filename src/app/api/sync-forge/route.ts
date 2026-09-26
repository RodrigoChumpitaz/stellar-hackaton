import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rpc } from "@stellar/stellar-sdk";
import { getSupabaseAdmin } from "@/shared/infrastructure/supabase-admin";
import { StellarAddressSchema } from "@/modules/cards/domain/schemas";
import type { Database } from "@/types/database.types";

export const runtime = "nodejs";

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

const SyncForgeSchema = z.object({
  txHash: z.string().regex(/^[0-9a-fA-F]{64}$/, "Hash de transacción inválido"),
  playerAddress: StellarAddressSchema,
  cardA_id: z.string(),
  cardB_id: z.string(),
  parentA_tokenId: z.number().int().positive(),
  parentB_tokenId: z.number().int().positive(),
  newTokenId: z.number().int().positive(),
  stats: z.object({
    name: z.string(),
    element: z.enum([
      "FIRE",
      "WATER",
      "EARTH",
      "AIR",
      "STEAM",
      "MAGMA",
      "LIGHTNING",
      "NATURE",
      "ICE",
      "SAND",
      "AETHER",
    ]),
    rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
    atk: z.number().int().min(1),
    def: z.number().int().min(1),
    metadata_uri: z.string().optional(),
    lore: z.string().optional().nullable(),
    passive_skill: z.string().optional().nullable(),
  }),
  nonce: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SyncForgeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos de sincronización inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      txHash,
      playerAddress,
      cardA_id,
      cardB_id,
      parentA_tokenId,
      parentB_tokenId,
      newTokenId,
      stats,
      nonce,
    } = parsed.data;

    // 1. Verificación en servidor de la transacción on-chain (Seguridad anti-spoofing)
    const server = new rpc.Server(RPC_URL);
    let txStatus = "NOT_FOUND";
    try {
      const txResult = await server.getTransaction(txHash);
      txStatus = txResult.status;
    } catch (rpcErr) {
      console.warn("Aviso al verificar tx en Soroban RPC:", rpcErr);
      // Permitimos continuar si hay timeout temporal de RPC pero no error definitivo
    }

    if (txStatus === "FAILED") {
      return NextResponse.json(
        { success: false, error: "La transacción falló en el ledger de Soroban." },
        { status: 400 }
      );
    }

    // 2. Sincronización transaccional en Supabase
    let supabaseAdmin = null;
    try {
      supabaseAdmin = getSupabaseAdmin();
    } catch {
      console.warn("Supabase Admin no configurado en servidor. Continuando en modo memoria/local.");
    }

    const nowIso = new Date().toISOString();
    const metadataUri = stats.metadata_uri || `local://cards/${encodeURIComponent(stats.name)}`;
    const imageUrl = metadataUri.startsWith("http") ? metadataUri : "/cards/crystal-logo.png";

    if (supabaseAdmin) {
      // 2a. Marcar cartas progenitoras como quemadas
      const { error: burnError } = await supabaseAdmin
        .from("user_cards")
        .update({
          is_burned: true,
          burned_at: nowIso,
        })
        .or(`id.in.(${cardA_id},${cardB_id}),token_id.in.(${parentA_tokenId},${parentB_tokenId})`)
        .eq("player_address", playerAddress);

      if (burnError) {
        console.warn("Aviso al marcar cartas quemadas en Supabase:", burnError.message);
      }

      // 2b. Insertar la nueva carta forjada
      const newCardRow: Database["public"]["Tables"]["user_cards"]["Insert"] = {
        player_address: playerAddress,
        token_id: newTokenId,
        name: stats.name,
        element: stats.element,
        rarity: stats.rarity,
        atk: stats.atk,
        def: stats.def,
        image_url: imageUrl,
        metadata_uri: metadataUri,
        lore: stats.lore || null,
        passive_skill: stats.passive_skill || null,
        is_forged: true,
        is_burned: false,
        mint_tx_hash: txHash,
      };

      const { data: insertedCard, error: insertError } = await supabaseAdmin
        .from("user_cards")
        .insert(newCardRow)
        .select()
        .single();

      if (insertError) {
        console.warn("Aviso al insertar nueva carta en Supabase:", insertError.message);
      }

      // 2c. Actualizar forge_history a CONFIRMED
      const { error: histUpdateError } = await supabaseAdmin
        .from("forge_history")
        .update({
          status: "CONFIRMED",
          confirmed_at: nowIso,
          tx_hash: txHash,
          result_card_id: insertedCard?.id || null,
        })
        .eq("player_address", playerAddress)
        .eq("new_token_id", newTokenId);

      if (histUpdateError) {
        console.warn("Aviso al actualizar forge_history en Supabase:", histUpdateError.message);
      }
    }

    // 3. Devolver la entidad de la carta para actualización inmediata en UI
    const resultingCard = {
      id: `forged-${newTokenId}-${Date.now()}`,
      token_id: newTokenId,
      name: stats.name,
      element: stats.element,
      rarity: stats.rarity,
      atk: stats.atk,
      def: stats.def,
      image_url: imageUrl,
      description: stats.lore || stats.passive_skill || "",
      lore: stats.lore || null,
      passive_skill: stats.passive_skill || null,
      mint_tx_hash: txHash,
    };

    return NextResponse.json({
      success: true,
      card: resultingCard,
      txHash,
      ledgerVerified: txStatus === "SUCCESS",
    });
  } catch (error) {
    console.error("Error en POST /api/sync-forge:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al sincronizar la forja" },
      { status: 500 }
    );
  }
}
