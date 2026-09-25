import { z } from "zod";
import { BASE_ELEMENTS, CARD_ELEMENTS, CARD_RARITIES, FORGE_STATUSES } from "./constants";

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

export type BaseCardSeed = z.infer<typeof BaseCardSeedSchema>;
