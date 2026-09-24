# Módulo 2 — Autenticación & Conectividad Web3

Paquete aislado para Stellar Runes. Conecta Freighter y las billeteras compatibles con Stellar Wallets Kit, fuerza Stellar Testnet, valida la clave `G...`, consulta la cuenta, fondea cuentas nuevas con Friendbot y expone `useWallet()`.

## Instalación

Requiere Node.js 22 o superior.

```bash
npm install
npm run typecheck
```

El kit v2 se distribuye prioritariamente en JSR. Esta carpeta usa su distribución npm compatible (`@creit.tech/stellar-wallets-kit`) para que las subrutas de módulos compilen de forma estable con npm/TypeScript en Windows; ambas exponen la misma API v2 usada aquí.

## Uso

```tsx
import { WalletButton, WalletProvider, type PasskeyConfig } from 'stellar-runes-modulo-2';

const passkeyConfig: PasskeyConfig = {
  accountWasmHash: process.env.VITE_PASSKEY_ACCOUNT_WASM_HASH!,
  webauthnVerifierAddress: process.env.VITE_PASSKEY_WEBAUTHN_VERIFIER_ADDRESS!,
  allowedOrigins: process.env.VITE_PASSKEY_ALLOWED_ORIGINS!.split(','),
};

function App() {
  return <WalletProvider passkeyConfig={passkeyConfig}><WalletButton /></WalletProvider>;
}
```

`signTransaction` delega en billeteras clásicas `G...`. Para Passkeys `C...`, `useWallet()` expone `signAndSubmitPasskeyTransaction()`, que aplica el ciclo obligatorio de firma WebAuthn, re-simulación y envío. `connectFreighter()` conserva el flujo directo de Freighter. El módulo no envía claves privadas ni semillas.

## Límites explícitos

- La red está fijada a `TESTNET`; Friendbot no se invoca fuera de ella.
- Passkeys se habilitan con `createPasskeyKit({ accountWasmHash, webauthnVerifierAddress, allowedOrigins })`. Smart Account Kit usa cuentas contrato `C...`; no se mezclan engañosamente con la identidad clásica `G...` requerida por el flujo de Friendbot.
