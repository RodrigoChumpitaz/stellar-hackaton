import { Suspense } from "react";
import { getCatalog } from "@/modules/cards/infrastructure/card-repository";
import { ForgeContainer } from "@/modules/forge/ui/ForgeContainer";
import { ForgeSkeleton } from "@/modules/forge/ui/ForgeSkeleton";
import type { CardData } from "@/modules/cards/domain/types";

export const dynamic = "force-dynamic";

const FALLBACK_CATALOG: CardData[] = [
  {
    id: 1,
    name: "Ignis Sprite",
    element: "FIRE",
    rarity: "COMMON",
    atk: 4,
    def: 2,
    image_url: "/cards/ignis-sprite.png",
    description: "Elemental de fuego menor. Ágil y agresivo en combate rápido.",
  },
  {
    id: 2,
    name: "Pyro Wyrm",
    element: "FIRE",
    rarity: "COMMON",
    atk: 4,
    def: 3,
    image_url: "/cards/ignis-sprite.png",
    description: "Sierpe ígnea nacida en magma primigenio. Furia destructiva concentrada.",
  },
  {
    id: 3,
    name: "Aqua Nymph",
    element: "WATER",
    rarity: "COMMON",
    atk: 2,
    def: 5,
    image_url: "/cards/aqua-nymph.png",
    description: "Ninfa etérea de aguas profundas con barrera reflectiva de vapor.",
  },
  {
    id: 4,
    name: "Abyssal Siren",
    element: "WATER",
    rarity: "COMMON",
    atk: 3,
    def: 4,
    image_url: "/cards/aqua-nymph.png",
    description: "Canto hipnótico que congela las mareas y calma el fragor bélico.",
  },
  {
    id: 5,
    name: "Terra Golem",
    element: "EARTH",
    rarity: "COMMON",
    atk: 3,
    def: 4,
    image_url: "/cards/earth.svg",
    description: "Centinela ancestral tallado en granito y minerales resonantes.",
  },
  {
    id: 6,
    name: "Titan Core",
    element: "EARTH",
    rarity: "COMMON",
    atk: 2,
    def: 5,
    image_url: "/cards/earth.svg",
    description: "Núcleo tectónico inquebrantable que resiste embestidas colosales.",
  },
  {
    id: 7,
    name: "Zephyr Wisp",
    element: "AIR",
    rarity: "COMMON",
    atk: 5,
    def: 1,
    image_url: "/cards/air.svg",
    description: "Espíritu de viento veloz que corta el espacio a su paso.",
  },
  {
    id: 8,
    name: "Vortex Falcon",
    element: "AIR",
    rarity: "COMMON",
    atk: 5,
    def: 2,
    image_url: "/cards/air.svg",
    description: "Cazador de tempestades aéreas con garras cargadas de estática pura.",
  },
];

async function ForgeLoader() {
  let catalogCards: CardData[] = FALLBACK_CATALOG;

  try {
    const rawCatalog = await getCatalog();
    if (rawCatalog && rawCatalog.length > 0) {
      catalogCards = rawCatalog.map((c) => ({
        id: c.id,
        name: c.name,
        element: c.element,
        rarity: c.rarity,
        atk: c.base_atk,
        def: c.base_def,
        image_url: c.image_url,
        description: c.description,
      }));
    }
  } catch (err) {
    console.warn("Usando catálogo de respaldo para la Forja:", (err as Error).message);
  }

  return <ForgeContainer initialCatalog={catalogCards} />;
}

export default function Home() {
  return (
    <Suspense fallback={<ForgeSkeleton />}>
      <ForgeLoader />
    </Suspense>
  );
}
