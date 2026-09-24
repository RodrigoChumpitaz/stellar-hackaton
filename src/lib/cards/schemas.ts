import { z } from "zod";
import { BASE_ELEMENTS, CARD_ELEMENTS, CARD_RARITIES, FORGE_STATUSES } from "./constants";
import { isStatLineValid } from "./forge-rules";

export const StellarAddressSchema = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, "Dirección Stellar inválida (se espera G... de 56 caracteres)");

export const TxHashSchema = z.string().regex(/^[0-9a-f]{64}$/, "Hash de transacción inválido");

export const CardElementSchema = z.enum(CARD_ELEMENTS);
export const BaseElementSchema = z.enum(BASE_ELEMENTS);
export const CardRaritySchema = z.enum(CARD_RARITIES);
export const ForgeStatusSchema = z.enum(FORGE_STATUSES);

const stat = z.number().int().nonnegative();

/** Semilla del catálogo (cartas comunes canónicas). */
export const BaseCardSeedSchema = z.object({
  name: z.string().min(1).max(100),
  element: BaseElementSchema,
  rarity: CardRaritySchema.default("COMMON"),
  base_atk: stat,
  base_def: stat,
  image_url: z.string().min(1),
  description: z.string().optional(),
});

/**
 * Lo que Gemini debe devolver al forjar (Módulo 4). Elemento y rareza
 * vienen de forge-rules; aquí solo se valida que los stats respeten el
 * presupuesto de la rareza calculada.
 */
export const GeneratedStatsSchema = z
  .object({
    name: z.string().min(1).max(120),
    element: CardElementSchema,
    rarity: CardRaritySchema,
    atk: stat,
    def: stat,
    passive_skill: z.string().min(1).max(280),
    lore: z.string().min(1).max(600),
  })
  .refine((s) => isStatLineValid(s.rarity, s.atk, s.def), {
    message: "ATK/DEF fuera del presupuesto de la rareza",
    path: ["atk"],
  });

export type BaseCardSeed = z.infer<typeof BaseCardSeedSchema>;
export type GeneratedStats = z.infer<typeof GeneratedStatsSchema>;
