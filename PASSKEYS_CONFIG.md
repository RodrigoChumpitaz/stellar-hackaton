# Configuración de Passkeys — Módulo 2

Este archivo reúne los valores públicos necesarios para habilitar cuentas inteligentes WebAuthn mediante `smart-account-kit` en Stellar Testnet.

> No incluyas claves privadas, secretos de despliegue, semillas `S...`, API keys ni credenciales de usuarios. Si se necesita un secreto, debe residir en un gestor de secretos o en variables de entorno fuera de Git.

## Valores requeridos

Completa estos valores después de desplegar la cuenta inteligente y el contrato verificador WebAuthn en Testnet.

```ts
export const passkeyConfig = {
  // Hash hexadecimal del WASM de la cuenta inteligente desplegada.
  accountWasmHash: 'PENDIENTE',

  // Dirección de contrato C... del verificador WebAuthn desplegado.
  webauthnVerifierAddress: 'PENDIENTE',

  // Orígenes HTTPS donde el navegador puede solicitar la passkey.
  // En desarrollo local puede usarse http://localhost:<puerto>.
  allowedOrigins: [
    'http://localhost:5173',
    // 'https://tu-dominio.example',
  ],
} as const;
```

## Uso en el módulo

```ts
import { createPasskeyKit } from './src/index.js';
// Importa o copia la configuración desde un archivo ignorado por Git.

const passkeyKit = createPasskeyKit(passkeyConfig);

// Restaurar una sesión existente o pedir una passkey al usuario.
const session = await passkeyKit.connectWallet({ prompt: true });
```

## Verificación previa

- `accountWasmHash` contiene exactamente 64 caracteres hexadecimales.
- `webauthnVerifierAddress` es una dirección de contrato Stellar válida (`C...`).
- Cada origen coincide exactamente con el dominio, protocolo y puerto usados por la aplicación.
- El despliegue y los valores pertenecen a Stellar Testnet.
- La cuenta clásica `G...` y la cuenta inteligente `C...` se tratan como identidades diferentes: Friendbot sólo fondea cuentas clásicas directamente.

## Recomendación de almacenamiento

Mantén la configuración real en un archivo local ignorado, por ejemplo `passkeys.local.ts`, o en variables de entorno inyectadas durante el build. Este documento sólo es una plantilla versionable.
