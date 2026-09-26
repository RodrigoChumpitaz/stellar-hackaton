import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/shared/infrastructure/supabase";
import { getCatalog, getUserCards, hasClaimedStarterDeck } from "@/modules/cards/infrastructure/card-repository";
import { StrKey } from "@stellar/stellar-sdk";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerAddress = body?.playerAddress;

    if (!playerAddress || !StrKey.isValidEd25519PublicKey(playerAddress)) {
      return NextResponse.json(
        { error: "playerAddress inválido o no provisto" },
        { status: 400 }
      );
    }

    const alreadyClaimed = await hasClaimedStarterDeck(playerAddress);
    if (alreadyClaimed) {
      const existingCards = await getUserCards(playerAddress);
      const cards = existingCards.map((c) => ({
        id: c.id,
        name: c.name,
        element: c.element,
        rarity: c.rarity,
        atk: c.atk,
        def: c.def,
        image_url: c.metadata_uri || c.image_url || "/cards/crystal-logo.png",
        description: c.lore || c.passive_skill || "",
        token_id: c.token_id,
      }));
      return NextResponse.json({
        success: false,
        message: "El cofre inicial ya fue reclamado previamente para esta cuenta.",
        cards,
        hasClaimedStarter: true,
      });
    }

    const catalog = await getCatalog();
    if (!catalog || catalog.length === 0) {
      return NextResponse.json(
        { error: "Catálogo no disponible en base de datos" },
        { status: 500 }
      );
    }


    // Insertar las cartas del catálogo en user_cards para el jugador
    const now = Date.now();
    const rowsToInsert = catalog.map((cat, idx) => ({
      player_address: playerAddress,
      token_id: (now % 1000000000) * 10 + idx + Math.floor(Math.random() * 1000),
      catalog_id: cat.id,
      is_forged: false,
      is_burned: false,
      name: cat.name,
      element: cat.element,
      rarity: cat.rarity,
      atk: cat.base_atk,
      def: cat.base_def,
      image_url: cat.image_url,
      metadata_uri: cat.image_url,
      mint_tx_hash: crypto
        .createHash("sha256")
        .update(`starter-${playerAddress}-${cat.id}-${now}-${idx}`)
        .digest("hex"),
    }));

    const { error } = await getSupabase().from("user_cards").insert(rowsToInsert);
    if (error) {
      console.warn("Nota al insertar en user_cards:", error.message);
    }

    // Consultar el inventario resultante del jugador
    const userCards = await getUserCards(playerAddress);
    const cards = userCards.map((c) => ({
      id: c.id,
      name: c.name,
      element: c.element,
      rarity: c.rarity,
      atk: c.atk,
      def: c.def,
      image_url: c.metadata_uri || c.image_url || "/cards/crystal-logo.png",
      description: c.lore || c.passive_skill || "",
      token_id: c.token_id,
    }));

    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error("Error en POST /api/cards/claim-starter:", error);
    return NextResponse.json(
      { error: "Error al procesar reclamo de cartas iniciales" },
      { status: 500 }
    );
  }
}
