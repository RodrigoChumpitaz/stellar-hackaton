import { BASE_ELEMENTS, CARD_RARITIES, ELEMENT_IMAGE, STAT_BUDGET } from "@/lib/cards/constants";
import { forgeElement, forgeRarity } from "@/lib/cards/forge-rules";
import { getCatalog, getUserCards, type UserCard } from "@/lib/cards/queries";
import { StellarAddressSchema } from "@/lib/cards/schemas";

// Página de verificación del Módulo 1: lee catálogo e inventario desde Supabase
// y muestra las reglas deterministas de forja. La reemplaza la UI del Módulo 3.

export default async function Home({ searchParams }: PageProps<"/">) {
  const { address } = await searchParams;
  const addr = typeof address === "string" ? address.trim() : "";
  const catalog = await getCatalog();

  let inventory: UserCard[] | null = null;
  let inventoryError: string | null = null;
  if (addr) {
    if (StellarAddressSchema.safeParse(addr).success) inventory = await getUserCards(addr);
    else inventoryError = "Dirección Stellar inválida (G… de 56 caracteres).";
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 text-zinc-100">
      <p className="text-xs font-semibold tracking-widest text-cyan-400">MÓDULO 1 · VERIFICACIÓN</p>
      <h1 className="mt-1 text-3xl font-bold">Stellar Runes · Catálogo & Base de datos</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Catálogo base <span className="text-sm font-normal text-zinc-400">({catalog.length} desde Supabase)</span>
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {catalog.map((card) => (
            <article key={card.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.image_url} alt={card.element} className="aspect-[5/7] w-full object-cover" />
              <div className="p-3">
                <h3 className="font-semibold">{card.name}</h3>
                <p className="text-xs text-zinc-400">
                  {card.rarity} · {card.element}
                </p>
                <p className="mt-2 font-mono text-sm">
                  ATK {card.base_atk} · DEF {card.base_def}
                </p>
                <p className="mt-2 text-xs text-zinc-400">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Inventario por jugador</h2>
        <form className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            name="address"
            defaultValue={addr}
            placeholder="G… dirección pública Stellar"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm"
          />
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black">Consultar</button>
        </form>
        {inventoryError && <p className="mt-3 text-sm text-red-400">{inventoryError}</p>}
        {inventory && (
          <p className="mt-3 text-sm text-zinc-400">
            {inventory.length === 0
              ? "Sin cartas todavía (se acuñan con claim_starter en el Módulo 5)."
              : `${inventory.length} cartas vivas.`}
          </p>
        )}
        {inventory && inventory.length > 0 && (
          <ul className="mt-3 divide-y divide-zinc-800 rounded-lg border border-zinc-800 font-mono text-sm">
            {inventory.map((c) => (
              <li key={c.id} className="flex justify-between px-3 py-2">
                <span>
                  #{c.token_id} {c.name}
                </span>
                <span className="text-zinc-400">
                  {c.element} · {c.rarity} · {c.atk}/{c.def}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Reglas de forja (deterministas)</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-zinc-400">A \ B</th>
                {BASE_ELEMENTS.map((b) => (
                  <th key={b} className="p-2 text-left">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BASE_ELEMENTS.map((a) => (
                <tr key={a} className="border-t border-zinc-800">
                  <th className="p-2 text-left">{a}</th>
                  {BASE_ELEMENTS.map((b) => {
                    const el = forgeElement(a, b);
                    return (
                      <td key={b} className="p-2">
                        <span className="inline-flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ELEMENT_IMAGE[el]} alt="" className="h-6 w-4 rounded-sm" />
                          {el}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-400">Híbrido + otro elemento distinto = AETHER.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {CARD_RARITIES.map((r) => (
            <span key={r} className="rounded-md border border-zinc-800 px-2 py-1">
              {r}: ATK+DEF {STAT_BUDGET[r].min}–{STAT_BUDGET[r].max}
              {r !== "LEGENDARY" && <span className="text-zinc-500"> → forja da {forgeRarity(r, r)}</span>}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
