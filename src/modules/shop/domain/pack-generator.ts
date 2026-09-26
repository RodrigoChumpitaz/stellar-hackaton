/**
 * Generador procedural de cartas para apertura de sobres (Pack Opening).
 * Bounded Context: Shop (Domain Layer)
 */

import type { Card, CardElement, CardRarity, CardTier } from "@/modules/cards/domain/types";
import type { BoosterPackDefinition } from "./shop-types";

// Nombres temáticos por elemento para cartas procedimentales
const ELEMENT_CREATURE_NAMES: Record<string, string[]> = {
  FIRE: ["Chispa Ígnea", "Dragón de Brasas", "Salamandra de Fuego", "Heraldo Solar", "Leviatán Carmesí"],
  WATER: ["Sirena de Arrecife", "Ondina Marina", "Espíritu Torrencial", "Quimera Abisal", "Leviatán de Marea"],
  EARTH: ["Centinela de Granito", "Guardián de Cuarzo", "Gólem Tectónico", "Basilisco Rocoso", "Titán Telúrico"],
  AIR: ["Céfiro Fugaz", "Halcón de Vendaval", "Sílfide de las Alturas", "Tempestad Menor", "Señor de los Vientos"],
  STEAM: ["Coloso de Caldera", "Vapor Condensado", "Quimera Geotérmica", "Elemental de Niebla", "Vapor Primigenio"],
  MAGMA: ["Núcleo de Lava", "Dragón de Magma", "Archon Volcánico", "Gigante Ígneo", "Basalto Fundido"],
  LIGHTNING: ["Chispa Relampagueante", "Pantera de Voltios", "Titán de Tormenta", "Arcángel Eléctrico", "Rayo Primordial"],
  ICE: ["Glaciar Andante", "Escarcha Espectral", "Coloso de Permafrost", "Lobo de Ventisca", "Ymir Escarchado"],
  NATURE: ["Dríada de Espinas", "Ent Milenario", "Espíritu de la Floresta", "Jaguar Silvestre", "Madre Selva"],
  AETHER: ["Emisario de Aether", "Soberano Astral", "Espectro Cósmico", "Seraph de Luz Pura", "Oráculo del Vacío"],
  CELESTIAL: ["Querubín Estelar", "Guardiana de las Pléyades", "Vigia de la Supernova", "Dragón Solar Cósmico"],
  VOID: ["Monolito del Vacío", "Horror de la Singularidad", "Parásito de Antimateria", "Devorador de Estrellas"],
  PLASMA: ["Fénix de Plasma", "Dragón Supercaliente", "Núcleo de Fusión", "Centinela Fotónico"],
};

const ELEMENT_ART_MAP: Record<string, string> = {
  FIRE: "/cards/ignis-sprite.png",
  WATER: "/cards/aqua-nymph.png",
  EARTH: "/cards/earth.svg",
  AIR: "/cards/air.svg",
  STEAM: "/cards/primordial-vapor.png",
  MAGMA: "/cards/magma.svg",
  LIGHTNING: "/cards/lightning.svg",
  ICE: "/cards/ice.svg",
  NATURE: "/cards/nature.svg",
  AETHER: "/cards/aether.svg",
  CELESTIAL: "/cards/aether.svg",
  VOID: "/cards/aether.svg",
  PLASMA: "/cards/magma.svg",
};

function getRandomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera el lote de cartas extraídas de un sobre al abrirlo.
 */
export function generatePackCards(pack: BoosterPackDefinition): Card[] {
  const cards: Card[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < pack.cardCount; i++) {
    const isGuaranteedSlot = i === pack.cardCount - 1;

    // Determinar rareza
    let rarity: CardRarity = "COMMON";
    let tier: CardTier = "F";
    let baseAtkRange = [3, 6];
    let baseDefRange = [2, 6];

    if (pack.rarityTier === "BASIC") {
      if (isGuaranteedSlot) {
        rarity = Math.random() < 0.3 ? "UNCOMMON" : "COMMON";
        tier = getRandomItem(["E+", "D-", "D", "D+"] as CardTier[]);
        baseAtkRange = [5, 9];
        baseDefRange = [4, 8];
      } else {
        rarity = "COMMON";
        tier = getRandomItem(["F-", "F", "F+", "E-", "E"] as CardTier[]);
        baseAtkRange = [3, 6];
        baseDefRange = [2, 6];
      }
    } else if (pack.rarityTier === "ELITE") {
      if (isGuaranteedSlot) {
        rarity = Math.random() < 0.25 ? "EPIC" : "RARE";
        tier = getRandomItem(["A-", "A", "A+", "B+"] as CardTier[]);
        baseAtkRange = [9, 14];
        baseDefRange = [8, 13];
      } else {
        const roll = Math.random();
        rarity = roll < 0.4 ? "RARE" : "UNCOMMON";
        tier = getRandomItem(["D+", "C-", "C", "C+", "B-", "B"] as CardTier[]);
        baseAtkRange = [6, 11];
        baseDefRange = [5, 10];
      }
    } else {
      // COSMIC PACK
      if (isGuaranteedSlot) {
        rarity = Math.random() < 0.35 ? "LEGENDARY" : "EPIC";
        tier = getRandomItem(["S-", "S", "S+", "SS-"] as CardTier[]);
        baseAtkRange = [13, 19];
        baseDefRange = [11, 18];
      } else {
        const roll = Math.random();
        rarity = roll < 0.25 ? "EPIC" : roll < 0.65 ? "RARE" : "UNCOMMON";
        tier = getRandomItem(["B+", "A-", "A", "A+", "S-"] as CardTier[]);
        baseAtkRange = [9, 15];
        baseDefRange = [8, 14];
      }
    }

    // Elegir elemento
    let element: CardElement;
    if (isGuaranteedSlot && pack.rarityTier === "ELITE") {
      const hybridPool: CardElement[] = ["STEAM", "MAGMA", "LIGHTNING", "ICE", "NATURE"];
      element = getRandomItem(hybridPool);
    } else if (isGuaranteedSlot && pack.rarityTier === "COSMIC") {
      const cosmicPool: CardElement[] = ["AETHER", "CELESTIAL", "VOID", "PLASMA"];
      element = getRandomItem(cosmicPool);
    } else {
      element = getRandomItem(pack.possibleElements);
    }

    // Estadísticas
    const atk = getRandomInt(baseAtkRange[0], baseAtkRange[1]);
    const def = getRandomInt(baseDefRange[0], baseDefRange[1]);
    const speed = getRandomInt(5, 16);
    const powerScore = Math.round(atk * 3.5 + def * 3.2 + speed * 1.5);

    // Nombre y arte
    const names = ELEMENT_CREATURE_NAMES[element] || ["Runa de Aether", "Guardián de Runas"];
    const baseName = getRandomItem(names);
    const titleSuffix = rarity === "LEGENDARY" ? " Supremo" : rarity === "EPIC" ? " Ancestral" : "";
    const fullName = `${baseName}${titleSuffix}`;

    const imageUrl = ELEMENT_ART_MAP[element] || "/cards/crystal-logo.png";

    const uniqueId = `shop-pack-${timestamp}-${i}-${Math.random().toString(36).substring(2, 6)}`;

    // Habilidad pasiva
    let passiveSkill: string | null = null;
    if (rarity === "EPIC" || rarity === "LEGENDARY" || (rarity === "RARE" && Math.random() < 0.6)) {
      passiveSkill = `Sintonía ${element}: Concede bonificación táctica de combate al entrar en juego.`;
    }

    cards.push({
      id: uniqueId,
      name: fullName,
      element,
      rarity,
      tier,
      atk,
      def,
      speed,
      power_score: powerScore,
      image_url: imageUrl,
      lore: `Extraída de las profundidades del ${pack.name}. Resuena con las frecuencias de la red Stellar.`,
      description: `Criatura de ${element} sintonizada para combate y síntesis de forja.`,
      passive_skill: passiveSkill,
    });
  }

  return cards;
}
