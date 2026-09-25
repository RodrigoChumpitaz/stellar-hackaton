import { describe, expect, it } from "vitest";
import { BASE_CATALOG } from "@/modules/cards/domain/catalog";
import {
  forgeElement,
  forgeRarity,
  isStatLineValid,
  calculateProgressiveStat,
  calculatePowerScore,
  clampStatsToBudget,
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

