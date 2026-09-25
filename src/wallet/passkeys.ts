import { SmartAccountKit, type SmartAccountConfig } from 'smart-account-kit';
import { IndexedDBStorage } from 'smart-account-kit/storage';
import { TESTNET } from '../stellar';

/** Configuración de despliegue que debe proveer el entorno anfitrión, nunca el navegador. */
export type PasskeyConfig = Pick<SmartAccountConfig, 'accountWasmHash' | 'webauthnVerifierAddress' | 'allowedOrigins'>;

/** Crea una cuenta inteligente WebAuthn real en Testnet; sus direcciones son C..., no G.... */
export function createPasskeyKit(config: PasskeyConfig) {
  return new SmartAccountKit({ ...config, rpcUrl: TESTNET.rpcUrl, networkPassphrase: TESTNET.networkPassphrase, storage: new IndexedDBStorage() });
}
