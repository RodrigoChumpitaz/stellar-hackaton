<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Stellar Runes (Aether TCG) — contexto para agentes

Hackathon Stellar Odyssey Perú 2026. Forja generativa de cartas: el jugador quema 2 cartas y el
contrato Soroban acuña una híbrida cuyos stats generó Gemini y firmó un oráculo Ed25519.
Stack: Next.js 16 (App Router, `src/`) · TypeScript · Supabase · Zod · Stellar Wallets Kit · Soroban (Rust) · Vercel.

Antes de tocar datos o reglas del juego, lee las skills del proyecto:
- `.agents/skills/data/SKILL.md` — la DB es read-model; quién escribe y cuándo.
- `.agents/skills/standards/SKILL.md` — elementos, reglas de forja, stats, metadata, payload del oráculo.
(`.agents/skills` es la fuente única de skills del repositorio para todas las IAs: Claude Code, OpenCode, ChatGPT / Codex, Cursor y Antigravity.)

## Estado de módulos
| # | Módulo | Estado |
|---|---|---|
| 1 | Catálogo & base de datos | ✅ Hecho: esquema aplicado en Supabase, catálogo sembrado, RLS verificado |
| 2 | Conexión de billetera (Stellar Wallets Kit / Freighter) | Pendiente |
| 3 | UI de selección y forja | Pendiente — reemplaza la página de verificación `src/app/page.tsx` |
| 4 | Oráculo: Gemini + firma Ed25519 (`/api/forge`) | Pendiente |
| 5 | Contrato Soroban: `claim_starter` + `forge` (burn & mint atómico) | Pendiente |
| 6 | Pipeline: simulate → assemble → sign → send → poll + sync DB | Pendiente |

## Decisiones ya tomadas (no re-litigar)
- **Next.js** (no Vite) para tener API routes del oráculo en el mismo deploy de Vercel. **Supabase** (no Neon).
- Jugadores identificados por wallet, **no** por Supabase Auth. RLS: lectura pública, sin políticas de escritura;
  solo el servidor escribe con `SUPABASE_SECRET_KEY` vía `getSupabaseAdmin()` (`src/lib/supabase-admin.ts`).
- Toda carta existe on-chain: las iniciales se acuñan con `claim_starter` (8 cartas, 2 por elemento base, una vez por dirección).
- Elemento y rareza del resultado son **deterministas** (`src/lib/cards/forge-rules.ts`); Gemini solo genera
  nombre, ATK/DEF dentro del presupuesto de la rareza, habilidad pasiva y lore.
- Arte fijo por elemento (`public/cards/<element>.svg`, hoy placeholders); la rareza se expresa con CSS.
- `forge_history.nonce` (UNIQUE) es el registro anti-replay; no crear otra tabla de nonces.

## Entorno y gotchas
- **Node ≥ 22** (`.node-version`, `engines`). Con Node 20 `supabase-js` falla al crear el cliente (WebSocket). Usar `fnm use 22`.
- Variables en `.env.local` (plantilla en `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY`, `SUPABASE_PROJECT_ID`, `GEMINI_API_KEY`, `GEMINI_MODEL`. Nunca commitear `.env.local`.
- **Gemini:** `gemini-2.0-flash` ya no existe en la API. Usar `GEMINI_MODEL` (hoy `gemini-3.5-flash-lite`; `gemini-3.5-flash`
  también probado). Salida estructurada con `responseSchema` y validar con `GeneratedStatsSchema`. Latencia observada ~5 s.
- `database.types.ts` es generado: no editar a mano. Para cambios de esquema, ver la skill `data`.
- El warning de hydration con `bis_skin_checked` en dev lo causa una extensión del navegador, no el código.
- Postgres `BIGINT` (`token_id`) llega como `number` en TS; seguro hasta 2^53.

## Pendientes menores del Módulo 1
- El documento original pedía interfaces `BaseCard` y `ForgedCard`. Hoy existen `CatalogCard` y `UserCard`
  (`src/lib/cards/queries.ts`), y se distingue base de forjada con `is_forged`. Si un módulo lo necesita, agregar
  alias/tipos discriminados ahí mismo.
- `npm run db:types` contra el proyecto remoto no se probó (requiere `npx supabase login`). Los tipos actuales se
  generaron del mismo SQL de la migración sobre un Postgres local, por lo que coinciden con la DB.
- IDs de `cards_catalog` empiezan en 2 (secuencia consumida en un intento previo). Referenciar cartas base por
  `name` o por el `id` leído, nunca por un id fijo.
