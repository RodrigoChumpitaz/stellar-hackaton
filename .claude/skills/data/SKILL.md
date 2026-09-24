---
name: data
description: Reglas de la capa de datos de Stellar Runes (Supabase/Postgres como read-model de Soroban). Usar al tocar supabase/migrations, src/types/database.types.ts, src/lib/supabase*.ts, src/lib/cards/queries.ts o cualquier código que lea/escriba user_cards, cards_catalog o forge_history.
---

# Capa de datos (read-model híbrido)

## Principio central
**La blockchain (contrato Soroban en Testnet) es la fuente de verdad.** Supabase es un
índice/caché para que la UI no consulte Soroban RPC en cada render. Si DB y cadena
discrepan, gana la cadena y la DB se corrige.

- On-chain: `token_id`, dueño, stats mínimos y `stats_hash` firmado por el oráculo.
- Off-chain (Supabase): nombre, lore, habilidad pasiva, `image_url`, `metadata_uri`, historial.

## Quién escribe
- **Lectura:** pública (`getSupabase()` en `src/lib/supabase.ts`, publishable key). RLS permite solo SELECT.
- **Escritura:** únicamente el backend con `getSupabaseAdmin()` (`src/lib/supabase-admin.ts`,
  secret key `sb_secret_...`, `import "server-only"`). No existen políticas INSERT/UPDATE: no las agregues.
- Nunca escribir en `user_cards` antes de que la tx esté confirmada (`getTransaction` = `SUCCESS`).

## Flujos de escritura
1. **Starter pack** (`claim_starter` on-chain): tras confirmar, insertar 8 filas en `user_cards`
   (2 por elemento base) con `catalog_id`, `is_forged = false`, `mint_tx_hash`.
2. **Forja**:
   - El oráculo (Módulo 4) inserta `forge_history` en `PENDING` al firmar (nonce + `expires_at`).
   - Al confirmar (Módulo 6), en una sola operación: marcar padres `is_burned = true, burned_at = now()`,
     insertar la carta resultante (`is_forged = true`, `stats_hash`), y actualizar `forge_history`
     a `CONFIRMED` con `tx_hash`, `result_card_id`, `confirmed_at`. Usar una función SQL (RPC) si hace falta atomicidad.
   - Si la tx falla → `FAILED`. Si vence `expires_at` sin tx → `EXPIRED`.
3. `forge_history.nonce` es UNIQUE: es el registro anti-replay. No crear otra tabla de nonces.

## Convenciones
- Tablas y columnas en `snake_case`; enums en inglés y MAYÚSCULAS (`FIRE`, `COMMON`, `PENDING`).
- Los valores de enums viven también en `src/lib/cards/constants.ts`: si cambias uno, cambia ambos.
- Direcciones: dominio `stellar_address` (`^G[A-Z2-7]{55}$`). Hashes de tx: dominio `stellar_tx_hash` (hex minúscula).
- Borrado lógico (`is_burned`), nunca `DELETE` de cartas.

## Cambiar el esquema
1. Crear un archivo nuevo en `supabase/migrations/` con prefijo `YYYYMMDDHHMMSS_`. No editar migraciones ya aplicadas.
2. Aplicar: `npx supabase link --project-ref <ref>` y luego `npx supabase db push`
   (o pegar el SQL en el SQL Editor de Supabase).
3. Regenerar tipos: `SUPABASE_PROJECT_ID=<ref> npm run db:types`. No editar `database.types.ts` a mano.
4. Actualizar los schemas Zod en `src/lib/cards/schemas.ts` si cambian columnas validadas.
