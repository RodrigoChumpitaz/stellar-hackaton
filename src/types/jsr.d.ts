/**
 * Next.js no resuelve esquemas `jsr:` en su comprobador TypeScript. Deno
 * verifica las importaciones reales mediante `npm run wallet:typecheck`;
 * esta declaración permite que Next compruebe los archivos de la aplicación
 * sin sustituir ni ocultar la dependencia oficial de JSR.
 */
declare module "jsr:@creit-tech/stellar-wallets-kit@^2.7.0" {
  export const StellarWalletsKit: new (options: unknown) => {
    setNetwork: (network: unknown) => void;
    openModal: (options: unknown) => Promise<unknown>;
    getAddress: () => Promise<{ address: string }>;
    disconnect: () => Promise<void>;
  };
  export const Networks: { TESTNET: string };
}

declare module "jsr:@creit-tech/stellar-wallets-kit@^2.7.0/modules/utils" {
  export function defaultModules(): unknown[];
}
