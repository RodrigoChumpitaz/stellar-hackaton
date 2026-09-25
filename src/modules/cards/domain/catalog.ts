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
    name: "Pyro Wyrm",
    element: "FIRE",
    base_atk: 4,
    base_def: 3,
    image_url: ELEMENT_IMAGE.FIRE,
    description: "Sierpe ígnea nacida en magma primigenio. Furia destructiva concentrada.",
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
    name: "Abyssal Siren",
    element: "WATER",
    base_atk: 3,
    base_def: 4,
    image_url: ELEMENT_IMAGE.WATER,
    description: "Canto hipnótico que congela las mareas y calma el fragor bélico.",
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
    name: "Titan Core",
    element: "EARTH",
    base_atk: 2,
    base_def: 5,
    image_url: ELEMENT_IMAGE.EARTH,
    description: "Núcleo tectónico inquebrantable que resiste embestidas colosales.",
  },
  {
    name: "Zephyr Wisp",
    element: "AIR",
    base_atk: 5,
    base_def: 1,
    image_url: ELEMENT_IMAGE.AIR,
    description: "Un soplo veloz que golpea antes de que lo veas llegar.",
  },
  {
    name: "Vortex Falcon",
    element: "AIR",
    base_atk: 5,
    base_def: 2,
    image_url: ELEMENT_IMAGE.AIR,
    description: "Cazador de tempestades aéreas con garras cargadas de estática pura.",
  },
]);
