# Stellar Runes (Aether TCG)

Forja generativa de cartas en Stellar: dos cartas se queman y nace una híbrida (Gemini + firma
Ed25519 del oráculo + contrato Soroban atómico). Stellar Odyssey Hackathon Perú 2026.

Stack: Next.js 16 · TypeScript · Supabase · Zod · Stellar Wallets Kit · Soroban (Rust) · Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # completar llaves
```

### Base de datos (Módulo 1)
1. Aplicar el esquema en Supabase, con una de estas opciones:
   - **SQL Editor:** pegar `supabase/migrations/20260924000000_init_schema.sql` y ejecutar.
   - **CLI:** `npx supabase login && npx supabase link --project-ref <ref> && npx supabase db push`
2. Sembrar el catálogo base: `npm run db:seed`
3. (Tras cambiar el esquema) regenerar tipos: `SUPABASE_PROJECT_ID=<ref> npm run db:types`

## Scripts
| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests (reglas de forja, schemas) |
| `npm run typecheck` | Verificación de tipos |
| `npm run db:seed` | Upsert de las 4 cartas base en `cards_catalog` |
| `npm run db:types` | Genera `src/types/database.types.ts` desde Supabase |

## Estructura
```
supabase/migrations/     Esquema SQL (enums, tablas, RLS)
src/lib/cards/           Dominio: constantes, reglas de forja, schemas Zod, catálogo, queries
src/lib/supabase.ts      Cliente público (solo lectura)
src/lib/supabase-admin.ts  Cliente servidor (secret key)
src/types/               Tipos generados de la DB
public/cards/            Arte por elemento (placeholders)
.claude/skills/          Convenciones: `data` y `standards` (enlazado en .agents/skills)
```
