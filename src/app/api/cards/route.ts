import { NextRequest, NextResponse } from "next/server";
import { getUserCards, hasClaimedStarterDeck } from "@/modules/cards/infrastructure/card-repository";
import { StrKey } from "@stellar/stellar-sdk";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const wallet = searchParams.get("wallet");

  if (!wallet || !StrKey.isValidEd25519PublicKey(wallet)) {
    return NextResponse.json(
      { error: "wallet inválido o no provisto" },
      { status: 400 }
    );
  }

  try {
    const userCards = await getUserCards(wallet);
    const hasClaimedStarter = await hasClaimedStarterDeck(wallet);

    // Si el usuario ya tiene cartas activas en Supabase, se devuelven
    if (userCards && userCards.length > 0) {
      const cards = userCards.map((c) => ({
        id: c.id,
        name: c.name,
        element: c.element,
        rarity: c.rarity,
        atk: c.atk,
        def: c.def,
        image_url: c.metadata_uri || "/cards/crystal-logo.png",
        description: c.lore || c.passive_skill || "",
        token_id: c.token_id,
      }));
      return NextResponse.json({ cards, hasClaimedStarter: true });
    }

    // Jugador nuevo (o sin cartas activas): inventario vacío y estado de reclamo
    return NextResponse.json({ cards: [], hasClaimedStarter });
  } catch (error) {
    console.error("Error en GET /api/cards:", error);
    return NextResponse.json(
      { error: "Error al consultar inventario en base de datos" },
      { status: 500 }
    );
  }
}

