<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Stellar Runes (Aether TCG) — contexto para agentes

Hackathon Stellar Odyssey Perú 2026. Forja generativa de cartas: el jugador quema 2 cartas y el
contrato Soroban acuña una híbrida cuyos stats generó Gemini y firmó un oráculo Ed25519.
Stack: Next.js 16 (App Router, `src/`) · TypeScript · Supabase · Zod · Stellar Wallets Kit · Three.js · Soroban (Rust) · Vercel.

Antes de tocar datos o reglas del juego, lee las skills del proyecto:
- `.agents/skills/data/SKILL.md` — la DB es read-model; quién escribe y cuándo.
- Documentación técnica exhaustiva en `docs/`:
  - `docs/ARCHITECTURE.md` — Arquitectura limpia, bounded contexts y árbol de archivos.
  - `docs/MODULE_CARDS.md` — Catálogo, esquemas Zod, repositorio y detector de gestos.
  - `docs/MODULE_FORGE.md` — Matriz de fusión determinista, cristal WebGL Three.js y Workbench.
  - `docs/MODULE_ORACLE.md` — Endpoint `/api/forge`, Gemini structured outputs y firma binaria Ed25519.
  - `docs/MODULE_WALLET.md` — Stellar Wallets Kit, Freighter y preparación de transacciones.
  - `docs/MODULE_SOROBAN.md` — Contrato Soroban en Rust, arquitectura atómica Burn & Mint y despliegue Testnet.
(`.agents/skills` es la fuente única de skills del repositorio para todas las IAs: Claude Code, OpenCode, ChatGPT / Codex, Cursor y Antigravity.)

## Estado de módulos
| # | Módulo | Estado |
|---|---|---|
| 1 | Catálogo & base de datos | ✅ Hecho: esquema aplicado en Supabase, catálogo sembrado, RLS verificado |
| 2 | Conexión de billetera (Stellar Wallets Kit / Freighter) | ✅ Hecho: integrado en `src/modules/wallet/` y `TopNav` |
| 3 | UI de selección y forja | ✅ Hecho: Workbench con Three.js WebGL, modales 3D, gestos e inventario reactivo |
| 4 | Oráculo: Gemini + firma Ed25519 (`/api/forge`) | ✅ Hecho: `/api/forge` con Gemini JSON Schema, fallback local y firma canónica de 160 bytes |
| 5 | Contrato Soroban: `claim_starter` + `forge` (burn & mint atómico) | ✅ Hecho: `contracts/forge_contract/`, 7 tests unitarios ok, desplegado en Testnet (`CAXAZJAJXA4CU2GYK3TRIGGDZTOCJGNX2FFC7CZEITN2TG7IPGSX7NVD`) |
| 6 | Pipeline: simulate → assemble → sign → send → poll + sync DB | ⏳ Pendiente (Integración final frontend ↔ contrato) |

## Arquitectura y Bounded Contexts (`src/`)
El proyecto sigue **Clean Architecture pura** con Bounded Contexts:
- `src/modules/cards/`: Dominio de cartas, catálogo canónico, repositorio Supabase e interacción táctil.
- `src/modules/forge/`: Matriz elemental, orquestador de síntesis, cristal WebGL Three.js y máquina de estados del altar.
- `src/modules/wallet/`: Proveedor Web3 y adaptadores de cuenta.
- `src/shared/`: Infraestructura transversal (`supabase.ts`, `supabase-admin.ts`, `stellar.ts`) y UI compartida (`TopNav`, `Elements`, `AppProviders`).
- `src/app/`: Delivery mechanism delgado (Route Handler `/api/forge` y página `page.tsx`).
- `src/wallet/` & `src/index.ts`: Punto de entrada verificado por Deno (`npm run wallet:typecheck`).

## Decisiones ya tomadas (no re-litigar)
- **Next.js** (no Vite) para tener API routes del oráculo en el mismo deploy de Vercel. **Supabase** (no Neon).
- Jugadores identificados por wallet, **no** por Supabase Auth. RLS: lectura pública, sin políticas de escritura;
  solo el servidor escribe con `SUPABASE_SECRET_KEY` vía `getSupabaseAdmin()` (`src/shared/infrastructure/supabase-admin.ts`).
- Toda carta existe on-chain: las iniciales se acuñan con `claim_starter` (8 cartas, 2 por elemento base, una vez por dirección).
- Elemento y rareza del resultado son **deterministas** (`src/modules/forge/domain/forge-rules.ts`); Gemini solo genera
  nombre, ATK/DEF dentro del presupuesto de la rareza, habilidad pasiva y lore.
- Arte fijo por elemento (`public/cards/<element>.svg`, hoy placeholders); la rareza se expresa con CSS / Three.js.
- `forge_history.nonce` (UNIQUE) es el registro anti-replay; no crear otra tabla de nonces.

## Entorno y gotchas
- **Node ≥ 22** (`.node-version`, `engines`). Con Node 20 `supabase-js` falla al crear el cliente (WebSocket). Usar `fnm use 22`.
- Variables en `.env.local` (plantilla en `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY`, `SUPABASE_PROJECT_ID`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `ORACLE_SECRET_KEY`, `SOROBAN_CONTRACT_ADDRESS`. Nunca commitear `.env.local`.
- **Gemini:** `gemini-2.0-flash` ya no existe en la API. Usar `GEMINI_MODEL` (hoy `gemini-3.5-flash-lite`; `gemini-3.5-flash`
  también probado). Salida estructurada con `responseSchema` y validar con `GeneratedStatsSchema`. Latencia observada ~5 s (con fallback a los 2 s).
- `database.types.ts` es generado: no editar a mano. Para cambios de esquema, ver la skill `data`.
- El warning de hydration con `bis_skin_checked` en dev lo causa una extensión del navegador, no el código.
- Postgres `BIGINT` (`token_id`) llega como `number` en TS; seguro hasta 2^53.
