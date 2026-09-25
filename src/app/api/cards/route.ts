import { NextRequest, NextResponse } from "next/server";
import { getUserCards, getCatalog } from "@/modules/cards/infrastructure/card-repository";
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

    // Si el usuario ya tiene cartas forjadas o adquiridas en Supabase, se devuelven
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
      }));
      return NextResponse.json({ cards });
    }

    // Si es un jugador nuevo en Testnet sin cartas en user_cards, devolvemos el catálogo de inicio
    const catalog = await getCatalog();
    const starterCards = catalog.map((c) => ({
      id: c.id,
      name: c.name,
      element: c.element,
      rarity: c.rarity,
      atk: c.base_atk,
      def: c.base_def,
      image_url: c.image_url,
      description: c.description || "",
    }));

    return NextResponse.json({ cards: starterCards });
  } catch (error) {
    console.error("Error en GET /api/cards:", error);
    return NextResponse.json(
      { error: "Error al consultar inventario en base de datos" },
      { status: 500 }
    );
  }
}
