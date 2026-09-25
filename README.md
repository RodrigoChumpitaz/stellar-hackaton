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

## Módulo 2 — Autenticación & Conectividad Web3

Conecta Freighter y las billeteras compatibles con Stellar Wallets Kit, fija Stellar Testnet,
valida la clave clásica `G...`, consulta la cuenta y fondea cuentas nuevas con Friendbot. También
integra Smart Account Kit para cuentas Passkey `C...` cuando se proporciona su configuración.

El kit v2 se consume desde JSR, usando `jsr:@creit-tech/stellar-wallets-kit@^2.7.0`; el chequeo
`npm run wallet:typecheck` valida esas importaciones con Deno. Requiere Node.js 22 o superior.

```tsx
"use client";

import { WalletButton, WalletProvider } from "@/index";

export function WalletArea() {
  return (
    <WalletProvider>
      <WalletButton />
    </WalletProvider>
  );
}
```

Para habilitar Passkeys, pasa a `WalletProvider` un `passkeyConfig` con
`accountWasmHash`, `webauthnVerifierAddress` y `allowedOrigins`, alimentado exclusivamente por
las variables públicas `NEXT_PUBLIC_PASSKEY_*` de `.env.local`. `signTransaction` atiende wallets
clásicas `G...`; `signAndSubmitPasskeyTransaction()` atiende el flujo WebAuthn de cuentas `C...`.
El módulo no envía claves privadas ni semillas.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida el Wallet Kit JSR y compila la aplicación Next.js |
| `npm test` | Tests (reglas de forja, schemas) |
| `npm run typecheck` | Verificación de tipos de Next.js y Wallet Kit |
| `npm run db:seed` | Upsert de las 4 cartas base en `cards_catalog` |
| `npm run db:types` | Genera `src/types/database.types.ts` desde Supabase |

## Estructura

```
supabase/migrations/       Esquema SQL (enums, tablas, RLS)
src/lib/cards/             Dominio: constantes, reglas de forja, schemas Zod, catálogo, queries
src/lib/supabase.ts        Cliente público (solo lectura)
src/lib/supabase-admin.ts  Cliente servidor (secret key)
src/types/                 Tipos generados de la DB
src/wallet/                Provider, botones y adaptadores de wallet del Módulo 2
public/cards/              Arte por elemento (placeholders)
.agents/skills/            Convenciones: `data`, `standards` y `dapp`
```

## Límites explícitos del Módulo 2

- La red está fijada a `TESTNET`; Friendbot no se invoca fuera de ella.
- Las Passkeys requieren contratos desplegados y variables `NEXT_PUBLIC_PASSKEY_*` reales.
- Smart Account Kit usa cuentas contrato `C...`; no se mezclan con la identidad clásica `G...`
  requerida por Friendbot.
