import { describe, it, expect } from "vitest";
import { calculateForgePreview, synthesizeHybridCard, InvalidForgeCombinationError } from "./forge-service";
import type { Card } from "@/modules/cards/domain/types";

describe("ForgeEngineService (Application Service)", () => {
  const ignisSprite: Card = {
    id: "card-1",
    name: "Ignis Sprite",
    element: "FIRE",
    rarity: "COMMON",
    atk: 4,
    def: 2,
  };

  const aquaNymph: Card = {
    id: "card-2",
    name: "Aqua Nymph",
    element: "WATER",
    rarity: "COMMON",
    atk: 2,
    def: 5,
  };

  it("calculates accurate forge preview for FIRE + WATER (STEAM / UNCOMMON)", () => {
    const preview = calculateForgePreview(ignisSprite, aquaNymph);

    expect(preview.derivedElement).toBe("STEAM");
    expect(preview.derivedRarity).toBe("UNCOMMON");
    expect(preview.budgetMin).toBe(8);
    expect(preview.budgetMax).toBe(10);
  });

  it("throws InvalidForgeCombinationError when attempting to forge identical card", () => {
    expect(() => calculateForgePreview(ignisSprite, ignisSprite)).toThrow(
      InvalidForgeCombinationError
    );
  });

  it("synthesizes valid hybrid card adhering to rarity budget", () => {
    const hybrid = synthesizeHybridCard(ignisSprite, aquaNymph);

    expect(hybrid.element).toBe("STEAM");
    expect(hybrid.rarity).toBe("UNCOMMON");
    expect(hybrid.atk + hybrid.def).toBeGreaterThanOrEqual(8);
    expect(hybrid.atk + hybrid.def).toBeLessThanOrEqual(10);
    expect(hybrid.name).toBe("Vapor Primordial #211");
    expect(hybrid.image_url).toBe("/cards/primordial-vapor.png");
  });
});
