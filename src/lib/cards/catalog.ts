import { ELEMENT_IMAGE } from "./constants";
import { BaseCardSeedSchema, type BaseCardSeed } from "./schemas";

// Cartas comunes canónicas. Fuente única para el seed y para el contrato.
export const BASE_CATALOG: readonly BaseCardSeed[] = BaseCardSeedSchema.array().parse([
  {
    name: "Ignis Sprite",
    element: "FIRE",
    base_atk: 4,
    base_def: 2,
    image_url: ELEMENT_IMAGE.FIRE,
    description: "Una chispa inquieta nacida de las brasas del primer fuego.",
  },
  {
    name: "Aqua Nymph",
    element: "WATER",
    base_atk: 2,
    base_def: 5,
    image_url: ELEMENT_IMAGE.WATER,
    description: "Guardiana de manantiales que se protege tras un velo de marea.",
  },
  {
    name: "Terra Golem",
    element: "EARTH",
    base_atk: 3,
    base_def: 4,
    image_url: ELEMENT_IMAGE.EARTH,
    description: "Piedra antigua que despertó con el pulso de la montaña.",
  },
  {
    name: "Zephyr Wisp",
    element: "AIR",
    base_atk: 5,
    base_def: 1,
    image_url: ELEMENT_IMAGE.AIR,
    description: "Un soplo veloz que golpea antes de que lo veas llegar.",
  },
]);
