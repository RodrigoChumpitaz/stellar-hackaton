import { StellarWalletsKit, Networks } from 'jsr:@creit-tech/stellar-wallets-kit@^2.7.0';
import { defaultModules } from 'jsr:@creit-tech/stellar-wallets-kit@^2.7.0/modules/utils';

let initialized = false;

/** Inicializa el singleton de Wallets Kit una única vez, incluso con React StrictMode. */
export function walletKit() {
  if (!initialized) {
    StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET });
    initialized = true;
  }
  return StellarWalletsKit;
}
