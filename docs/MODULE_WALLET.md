# Módulo de Billetera & Web3 (`src/modules/wallet`)

El módulo `wallet` gestiona la autenticación descentralizada, la conexión multibillete (Freighter, Passkeys, Lobstr, xBull) y la firma de transacciones en la red Stellar.

---

## 1. Estructura del Módulo

```text
src/modules/wallet/
├── infrastructure/
│   └── index.ts               # Adaptador e inicialización de Stellar Wallets Kit
├── ui/
│   ├── WalletButton.tsx       # Botón de conexión y estado de cuenta abreviada
│   └── WalletProvider.tsx     # Contexto de React para estado de wallet global
└── index.ts                   # Exportación pública del módulo
```

Adicionalmente, se mantiene en la raíz:
* `src/wallet/`: Código fuente de la biblioteca de wallet para empaquetado y compatibilidad con Deno (`jsr:`).
* `src/index.ts`: Punto de entrada verificado por `npm run wallet:typecheck`.

---

## 2. Tecnologías y Estándares

* **Stellar Wallets Kit (`@creit-tech/stellar-wallets-kit`)**: Proporciona una interfaz modal unificada para conectar billeteras sin forzar al usuario a una extensión específica.
* **Freighter API (`@stellar/freighter-api`)**: Detección nativa de la extensión oficial de Stellar.
* **Passkeys (SEP-0030 / Smart Accounts)**: Preparado para soportar autenticación biométrica WebAuthn sin necesidad de extensiones tradicionales.
* **Red de Operación**: Stellar Testnet (`Networks.TESTNET` / `Test SDF Network ; September 2015`).
* **Horizon / Soroban RPC**: `https://soroban-testnet.stellar.org`.

---

## 3. Hook de Consumo (`useWallet`)

El contexto expone un hook reactivo con la siguiente interfaz:

```typescript
interface WalletContextType {
  address: string | null;           // Dirección pública 'G...' del jugador conectado
  isConnected: boolean;             // Indicador de conexión activa
  isConnecting: boolean;            // Indicador de modal de conexión abierto
  connect: () => Promise<void>;     // Abre el modal multibillete
  disconnect: () => Promise<void>;  // Desconecta la sesión y limpia el estado local
  signTransaction: (xdr: string) => Promise<string>; // Firma XDR para Soroban
}
```

---

## 4. Guía para Integración con Módulo 5 y Módulo 6

Cuando se integre el Módulo 5 (Contrato Soroban) y el Módulo 6 (Pipeline de transacciones):
1. **Simulación**: Usar `@stellar/stellar-sdk` para simular la invocación de `forge` en Soroban RPC.
2. **Ensamblado**: Construir la transacción con el XDR devuelto por la simulación.
3. **Firma**: Invocar `wallet.signTransaction(xdr)` que delegará la firma a Freighter o Passkeys.
4. **Envío y Sondeo**: Enviar la transacción firmada a Soroban RPC (`sendTransaction`) y sondear el estado con `getTransaction` hasta confirmación (`SUCCESS`).
