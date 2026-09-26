import { describe, expect, it } from "vitest";
import { BASE_CATALOG } from "@/modules/cards/domain/catalog";
import {
  forgeElement,
  forgeRarity,
  isStatLineValid,
  calculateProgressiveStat,
  calculatePowerScore,
  clampStatsToBudget,
  calculateTierSuccessRate,
  calculateTierOutcome,
  calculateSkillChance,
  synthesizeAlchemicalElement,
  getTierIndex,
} from "./forge-rules";
import { GeneratedStatsSchema } from "./schemas";

describe("forgeElement", () => {
  it.each([
    ["FIRE", "WATER", "STEAM"],
    ["WATER", "FIRE", "STEAM"],
    ["FIRE", "EARTH", "MAGMA"],
    ["AIR", "FIRE", "LIGHTNING"],
    ["WATER", "EARTH", "NATURE"],
    ["AIR", "WATER", "ICE"],
    ["EARTH", "AIR", "SAND"],
  ] as const)("%s + %s = %s", (a, b, expected) => {
    expect(forgeElement(a, b)).toBe(expected);
  });

  it("mismo elemento conserva el elemento", () => {
    expect(forgeElement("FIRE", "FIRE")).toBe("FIRE");
    expect(forgeElement("STEAM", "STEAM")).toBe("STEAM");
  });

  it("híbrido + otra carta = AETHER", () => {
    expect(forgeElement("STEAM", "FIRE")).toBe("AETHER");
    expect(forgeElement("ICE", "MAGMA")).toBe("AETHER");
    expect(forgeElement("AETHER", "WATER")).toBe("AETHER");
  });
});

describe("forgeRarity", () => {
  it("sube un nivel sobre el padre de mayor rareza", () => {
    expect(forgeRarity("COMMON", "COMMON")).toBe("UNCOMMON");
    expect(forgeRarity("COMMON", "RARE")).toBe("EPIC");
  });

  it("tope en LEGENDARY", () => {
    expect(forgeRarity("EPIC", "LEGENDARY")).toBe("LEGENDARY");
  });
});

describe("stats", () => {
  it("las cartas base respetan el presupuesto COMMON", () => {
    for (const card of BASE_CATALOG) {
      expect(isStatLineValid("COMMON", card.base_atk, card.base_def)).toBe(true);
    }
  });

  it("rechaza stats fuera del presupuesto", () => {
    const base = { name: "Vapor Primordial", element: "STEAM", passive_skill: "Niebla", lore: "..." } as const;
    expect(GeneratedStatsSchema.safeParse({ ...base, rarity: "EPIC", atk: 8, def: 7 }).success).toBe(true);
    expect(GeneratedStatsSchema.safeParse({ ...base, rarity: "UNCOMMON", atk: 8, def: 7 }).success).toBe(false);
    expect(GeneratedStatsSchema.safeParse({ ...base, rarity: "EPIC", atk: 0, def: 15 }).success).toBe(false);
  });

  it("calcula progresión continua con rendimientos decrecientes (sin hard cap arbitrario)", () => {
    // Progresión lineal debajo de 15
    expect(calculateProgressiveStat(4, 5, 1)).toBe(6);
    expect(calculateProgressiveStat(10, 12, 1)).toBe(13);

    // Escala asintótica con rendimientos decrecientes por encima de 15
    const highStat = calculateProgressiveStat(15, 16, 2);
    expect(highStat).toBeGreaterThan(15);
    // Un valor muy alto no explota a números absurdos
    const ultraStat = calculateProgressiveStat(25, 30, 2);
    expect(ultraStat).toBeLessThan(30);
  });

  it("calcula Power Score de forma determinista para control anti-rotas", () => {
    const score = calculatePowerScore(8, 7, 6, 1);
    // 8 + 7 + (6 * 0.5) + (1 * 2.0) = 15 + 3 + 2 = 20.0
    expect(score).toBe(20.0);
  });

  it("clampStatsToBudget normaliza cualquier alucinación de stats dentro del presupuesto legal", () => {
    const clamped = clampStatsToBudget(99, 99, "COMMON");
    expect(clamped.atk + clamped.def).toBeLessThanOrEqual(7);
    expect(clamped.atk + clamped.def).toBeGreaterThanOrEqual(6);
  });
});

describe("30-Tier Alphanumeric Rank System (F- to L+)", () => {
  it("resuelve tasas de éxito exactas para cartas del mismo rango", () => {
    const rateFMinus = calculateTierSuccessRate("F-", "F-");
    expect(rateFMinus.successRate).toBeCloseTo(0.60001, 4);

    const rateF = calculateTierSuccessRate("F", "F");
    expect(rateF.successRate).toBeCloseTo(0.55001, 4);

    const rateE = calculateTierSuccessRate("E", "E");
    expect(rateE.successRate).toBeCloseTo(0.44001, 4);

    const rateLPlus = calculateTierSuccessRate("L+", "L+");
    expect(rateLPlus.successRate).toBeCloseTo(0.00001, 5);
  });

  it("penaliza probabilidad cuando hay diferencia de rangos (gap penalty)", () => {
    const sameRate = calculateTierSuccessRate("C", "C").successRate;
    const diffRate = calculateTierSuccessRate("C", "F-").successRate;
    // La brecha (gap) reduce la probabilidad de éxito
    expect(diffRate).toBeLessThan(sameRate);
  });

  it("en caso de fracaso con gap, puede degradar a un rango menor que el máximo", () => {
    // roll = 1.0 (fracaso forzado)
    const outcome = calculateTierOutcome("A", "F-", 1.0);
    expect(outcome.isSuccess).toBe(false);
    expect(getTierIndex(outcome.resultingTier)).toBeLessThan(getTierIndex("A"));
  });

  it("en caso de éxito con mismo rango, asciende al rango superior", () => {
    // roll = 0.0 (éxito garantizado)
    const outcome = calculateTierOutcome("F-", "F-", 0.0);
    expect(outcome.isSuccess).toBe(true);
    expect(outcome.resultingTier).toBe("F");
  });
});

describe("Síntesis Alquímica y Elementos Divinos", () => {
  it("EARTH + EARTH genera evolución alquímica (STONK)", () => {
    expect(synthesizeAlchemicalElement("EARTH", "EARTH")).toBe("STONK");
    expect(synthesizeAlchemicalElement("FIRE", "FIRE")).toBe("INFERNO");
  });

  it("Cartas de rango L generan elementos cósmicos divinos", () => {
    const cosmic = synthesizeAlchemicalElement("FIRE", "WATER", "L");
    expect(["AETHER", "CELESTIAL", "VOID", "CHRONOS", "COSMOS"]).toContain(cosmic);
  });
});

describe("Sistema Progresivo de Habilidades", () => {
  it("cartas F no tienen probabilidad base de habilidad", () => {
    const { totalChance } = calculateSkillChance("F-", 0);
    expect(totalChance).toBe(0);
  });

  it("cartas a partir de rango E desbloquean probabilidad de habilidad oficial", () => {
    const chanceE = calculateSkillChance("E", 0);
    expect(chanceE.baseChance).toBeCloseTo(0.059, 3);

    const chanceLPlus = calculateSkillChance("L+", 0);
    expect(chanceLPlus.baseChance).toBeCloseTo(0.899, 3);
  });

  it("cada habilidad paterna otorga un bono de +5%", () => {
    const chanceWithoutParents = calculateSkillChance("D", 0).totalChance;
    const chanceWith2Parents = calculateSkillChance("D", 2).totalChance;
    // 2 habilidades paternas = +10% (0.10)
    expect(chanceWith2Parents).toBeCloseTo(chanceWithoutParents + 0.10, 3);
  });
});

