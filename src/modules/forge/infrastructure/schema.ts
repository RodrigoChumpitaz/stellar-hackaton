import { z } from "zod";
import { CardElementSchema, CardRaritySchema } from "@/modules/cards/domain/schemas";

// Input del endpoint POST /api/forge
export const ForgeRequestSchema = z.object({
  playerAddress: z.string().startsWith("G").length(56),
  cardA_id: z.string().uuid(),
  cardB_id: z.string().uuid(),
});
export type ForgeRequest = z.infer<typeof ForgeRequestSchema>;

// Lo que Gemini debe devolver (Structured Output / response_schema)
export const CardStatsSchema = z.object({
  name: z.string().max(120),
  element: CardElementSchema,
  rarity: CardRaritySchema,
  atk: z.number().int().min(1).max(15),
  def: z.number().int().min(1).max(15),
  passive_skill: z.string(),
  lore: z.string(),
});
export type CardStats = z.infer<typeof CardStatsSchema>;

// Respuesta final del endpoint
export const ForgeResponseSchema = z.object({
  success: z.literal(true),
  newTokenId: z.string(),
  stats: CardStatsSchema.extend({ metadata_uri: z.string() }),
  nonce: z.string(),
  oraclePublicKey: z.string(),
  oracleSignature: z.string(), // hex de 64 bytes
});
