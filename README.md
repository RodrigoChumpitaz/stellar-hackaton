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
import { WalletButton, WalletProvider, useWallet } from 'stellar-runes-modulo-2';

function App() {
  return <WalletProvider><WalletButton /></WalletProvider>;
}

// En pantallas que necesitan firmar XDR:
const { publicKey, isConnected, signTransaction } = useWallet();
```

`signTransaction` delega en la billetera seleccionada. Para priorizar Freighter, `useWallet()` también expone `connectFreighter()`: comprueba instalación, solicita acceso y exige Testnet antes de aceptar la sesión. El módulo no envía transacciones ni guarda claves privadas.

## Límites explícitos

- La red está fijada a `TESTNET`; Friendbot no se invoca fuera de ella.
- Passkeys se habilitan con `createPasskeyKit({ accountWasmHash, webauthnVerifierAddress, allowedOrigins })`. Smart Account Kit usa cuentas contrato `C...`; no se mezclan engañosamente con la identidad clásica `G...` requerida por el flujo de Friendbot.
