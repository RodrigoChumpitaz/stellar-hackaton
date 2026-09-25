import { describe, expect, it } from "vitest";
import { BASE_CATALOG } from "@/modules/cards/domain/catalog";
import { forgeElement, forgeRarity, isStatLineValid } from "./forge-rules";
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
});
