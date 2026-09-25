import { z } from "zod";
import { CardElementSchema, CardRaritySchema } from "@/modules/cards/domain/schemas";
import { isStatLineValid } from "./forge-rules";

const stat = z.number().int().nonnegative();

/**
 * Lo que Gemini debe devolver al forjar. Elemento y rareza
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

export type GeneratedStats = z.infer<typeof GeneratedStatsSchema>;
