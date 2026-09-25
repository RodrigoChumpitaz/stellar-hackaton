import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { StellarAddressSchema, GeneratedStatsSchema } from "@/lib/cards/schemas";
import { forgeElement, forgeRarity } from "@/lib/cards/forge-rules";
import { STAT_BUDGET } from "@/lib/cards/constants";
import { generateFusionText, generateFallbackFusionText } from "./gemini-client";
import { buildCanonicalPayloadHash, signPayload, Networks } from "./oracle-crypto";

export const runtime = "nodejs"; // necesitamos node:crypto, no Edge

// ⚠️ AJUSTA cuando el Módulo 5 despliegue el contrato:
const CONTRACT_ADDRESS = process.env.SOROBAN_CONTRACT_ADDRESS!;
const NETWORK_PASSPHRASE = Networks.TESTNET;
const FORGE_EXPIRATION_MINUTES = 5;

const ForgeRequestSchema = z.object({
  playerAddress: StellarAddressSchema,
  cardA_id: z.string().uuid(),
  cardB_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validar input (reusa StellarAddressSchema del proyecto)
    const body = await req.json();
    const parsed = ForgeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Input inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { playerAddress, cardA_id, cardB_id } = parsed.data;

    if (cardA_id === cardB_id) {
      return NextResponse.json({ success: false, error: "No puedes fusionar una carta consigo misma." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin(); // cliente ya existente del proyecto

    // 2. Verificar propiedad, que no esté quemada, y que sea carta base (no ya forjada)
    const { data: cards, error: dbError } = await supabase
      .from("user_cards")
      .select("*")
      .in("id", [cardA_id, cardB_id])
      .eq("player_address", playerAddress)
      .eq("is_burned", false)
      .eq("is_forged", false);

    if (dbError) {
      return NextResponse.json({ success: false, error: "Error de base de datos" }, { status: 500 });
    }
    if (!cards || cards.length !== 2) {
      return NextResponse.json(
        { success: false, error: "Una o ambas cartas no existen, no te pertenecen, ya fueron quemadas, o no son cartas base." },
        { status: 403 }
      );
    }
    const [cardA, cardB] = cards;

    // 3. Elemento y rareza son DETERMINISTAS (forge-rules.ts) — Gemini no los decide
    const element = forgeElement(cardA.element, cardB.element);
    const rarity = forgeRarity(cardA.rarity, cardB.rarity);
    const budget = STAT_BUDGET[rarity];

    // 4. Generar nombre/lore/stats con Gemini (con fallback si falla o tarda)
    let generated;
    try {
      generated = await Promise.race([
        generateFusionText({ cardA, cardB, element, rarity, budget }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]);
    } catch {
      generated = generateFallbackFusionText({ cardA, cardB, element, rarity, budget });
    }

    // 5. Validar todo junto con el schema oficial del proyecto
    const stats = GeneratedStatsSchema.parse({
      name: generated.name,
      element,
      rarity,
      atk: generated.atk,
      def: generated.def,
      passive_skill: generated.passive_skill,
      lore: generated.lore,
    });

    const metadataUri = `local://cards/${encodeURIComponent(stats.name)}`;

        // 6. Rechazar si alguna de las dos cartas ya tiene una forja activa
    //    (CONFIRMED, o PENDING que todavía no expiró)
    const parentTokens = [cardA.token_id, cardB.token_id].join(",");
    const nowIso = new Date().toISOString();

    const { data: activeForges, error: histError } = await supabase
      .from("forge_history")
      .select("id")
      .or(`parent_a_token_id.in.(${parentTokens}),parent_b_token_id.in.(${parentTokens})`)
      .or(`status.eq.CONFIRMED,and(status.eq.PENDING,expires_at.gt.${nowIso})`)
      .limit(1);

    if (histError) {
      console.error("Error consultando forge_history:", histError);
      return NextResponse.json({ success: false, error: "Error de base de datos" }, { status: 500 });
    }
    if (activeForges && activeForges.length > 0) {
      return NextResponse.json(
        { success: false, error: "Alguna de estas cartas ya tiene una forja en curso o completada." },
        { status: 409 }
      );
    }

    // 7-9. Reservar token_id + firmar + registrar, con reintento si hay colisión
    const MAX_ATTEMPTS = 3;
    const expiresAt = new Date(Date.now() + FORGE_EXPIRATION_MINUTES * 60 * 1000).toISOString();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Próximo token_id = máximo entre cartas existentes Y forjas ya registradas
      const [{ data: maxCard }, { data: maxForge }] = await Promise.all([
        supabase.from("user_cards").select("token_id").order("token_id", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("forge_history").select("new_token_id").order("new_token_id", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const newTokenId =
        Math.max(Number(maxCard?.token_id ?? 0), Number(maxForge?.new_token_id ?? 0)) + 1;

      const nonce = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const payloadHash = buildCanonicalPayloadHash({
        networkPassphrase: NETWORK_PASSPHRASE,
        contractAddress: CONTRACT_ADDRESS,
        playerAddress,
        cardA_id: cardA.token_id,
        cardB_id: cardB.token_id,
        newTokenId,
        stats,
        metadataUri,
        nonce,
      });
      const { signatureHex, publicKey } = signPayload(payloadHash);

      const { error: insertError } = await supabase.from("forge_history").insert({
        player_address: playerAddress,
        parent_a_token_id: cardA.token_id,
        parent_b_token_id: cardB.token_id,
        new_token_id: newTokenId,
        generated_stats: stats,
        stats_hash: payloadHash.toString("hex"),
        nonce,
        oracle_signature: signatureHex,
        status: "PENDING",
        expires_at: expiresAt,
      });

      if (!insertError) {
        // 10. Solo se responde (y se entrega la firma) si el registro quedó guardado
        return NextResponse.json({
          success: true,
          newTokenId: newTokenId.toString(),
          stats: { ...stats, metadata_uri: metadataUri },
          nonce,
          oraclePublicKey: publicKey,
          oracleSignature: signatureHex,
        });
      }

      // Colisión de token_id o nonce (p. ej. dos peticiones simultáneas): reintentar
      const isCollision =
        insertError.code === "23505" &&
        /new_token_id|nonce/.test(`${insertError.details} ${insertError.message}`);

      if (!isCollision) {
        console.error("Error guardando forge_history:", insertError);
        return NextResponse.json({ success: false, error: "No se pudo registrar la forja" }, { status: 500 });
      }
      console.warn(`Colisión en forge_history (intento ${attempt}/${MAX_ATTEMPTS}), reintentando...`);
    }

    return NextResponse.json(
      { success: false, error: "Demasiadas forjas simultáneas, intenta de nuevo." },
      { status: 409 }
    );
  } catch (err) {
    console.error("Error en /api/forge:", err);
    return NextResponse.json({ success: false, error: "Error interno del oráculo" }, { status: 500 });
  }
}