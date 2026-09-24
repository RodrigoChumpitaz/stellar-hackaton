---
name: standards
description: Estándares de dominio de Stellar Runes compartidos por DB, oráculo Gemini, contrato Soroban y UI - elementos, reglas de forja, rangos de stats por rareza, formato de metadata NFT y payload firmado por el oráculo. Usar al implementar o cambiar forja, prompts de Gemini, el contrato, o el render de cartas.
---

# Estándares del dominio

La implementación de referencia está en `src/lib/cards/` (`constants.ts`, `forge-rules.ts`,
`schemas.ts`). El contrato Rust (Módulo 5) debe replicar exactamente estas reglas.

## Elementos
- Base: `FIRE`, `WATER`, `EARTH`, `AIR`. Solo estos existen en `cards_catalog`.
- Híbridos y `AETHER`: solo nacen de una forja.

## Reglas de forja (deterministas, NO las decide Gemini)
| Padres | Resultado |
|---|---|
| X + X (mismo elemento, cualquiera) | X |
| FIRE + WATER | STEAM |
| FIRE + EARTH | MAGMA |
| FIRE + AIR | LIGHTNING |
| WATER + EARTH | NATURE |
| WATER + AIR | ICE |
| EARTH + AIR | SAND |
| Híbrido/AETHER + otro distinto | AETHER |

**Rareza:** `max(rareza_a, rareza_b) + 1`, con tope en `LEGENDARY`.
Orden: `COMMON < UNCOMMON < RARE < EPIC < LEGENDARY`.

Los padres deben ser dos `token_id` distintos del mismo dueño y no quemados.

## Stats
- Cada stat (`atk`, `def`) es un entero entre 1 y 15.
- Presupuesto `atk + def` por rareza: COMMON 6–7 · UNCOMMON 8–10 · RARE 11–13 · EPIC 14–16 · LEGENDARY 17–20.
- Gemini propone nombre, `atk`, `def`, `passive_skill` y `lore`. El oráculo valida con
  `GeneratedStatsSchema` y reintenta o rechaza si no cumple. El contrato vuelve a validar el presupuesto.

## Arte
Una imagen fija por elemento: `public/cards/<element>.svg` (ver `ELEMENT_IMAGE`). La rareza se expresa
con el marco/estilo en CSS, no con otra imagen.

## Metadata NFT (`/api/metadata/[tokenId]`)
JSON estilo ERC-721/OpenSea, que es lo que leen exploradores y marketplaces:
```json
{
  "name": "Vapor Primordial",
  "description": "<lore>",
  "image": "https://<dominio>/cards/steam.svg",
  "attributes": [
    { "trait_type": "Element", "value": "STEAM" },
    { "trait_type": "Rarity", "value": "EPIC" },
    { "trait_type": "ATK", "value": 8 },
    { "trait_type": "DEF", "value": 7 },
    { "trait_type": "Passive", "value": "<passive_skill>" },
    { "trait_type": "Parents", "value": "104,208" }
  ]
}
```
Para la interfaz del contrato, preferir la de non-fungible de OpenZeppelin Stellar (`stellar-tokens`)
antes que SEP-41 (esa es para tokens fungibles). Confirmar la versión vigente antes de implementar.

## Payload del oráculo (se cierra en Módulo 4)
Campos firmados con Ed25519: `network_passphrase`, `contract_id`, `player`, `card_a`, `card_b`,
`new_token_id`, `stats_hash`, `nonce`, `expires_at`. `stats_hash = SHA-256` de los stats canónicos.
La codificación exacta en bytes (orden y serialización XDR) se define en el Módulo 4 y debe
documentarse aquí antes de escribir el contrato.
