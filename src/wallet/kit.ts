import { TESTNET } from '../stellar';

export interface WalletKitModalResult {
  address: string;
}

export interface WalletKitInstance {
  authModal: () => Promise<WalletKitModalResult>;
  selectedModule: { productName: string };
  getNetwork: () => Promise<{ networkPassphrase: string }>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string, opts?: { address?: string; networkPassphrase?: string }) => Promise<{ signedTxXdr: string }>;
  fetchAddress: () => Promise<{ address: string }>;
}

let kitInstance: WalletKitInstance | null = null;

/** Inicializa el adaptador de billetera Web3 (Freighter / Wallets Kit) compatible con Next.js. */
export function walletKit(): WalletKitInstance {
  if (kitInstance) return kitInstance;

  kitInstance = {
    selectedModule: { productName: 'Freighter' },
    authModal: async () => {
      const { requestAccess, isConnected } = await import('@stellar/freighter-api');
      const installed = await isConnected();
      if (!installed.isConnected || installed.error) {
        throw new Error('Freighter no está instalado. Instálalo desde https://www.freighter.app/');
      }
      const granted = await requestAccess();
      if (granted.error) throw new Error(granted.error.message || 'Error al conectar Freighter');
      return { address: granted.address };
    },
    getNetwork: async () => {
      const { getNetwork } = await import('@stellar/freighter-api');
      const net = await getNetwork();
      return { networkPassphrase: net.networkPassphrase || TESTNET.networkPassphrase };
    },
    disconnect: async () => {},
    signTransaction: async (xdr: string) => {
      const { signTransaction } = await import('@stellar/freighter-api');
      const res = await signTransaction(xdr, { networkPassphrase: TESTNET.networkPassphrase });
      if (res.error) throw new Error(res.error.message);
      return { signedTxXdr: res.signedTxXdr };
    },
    fetchAddress: async () => {
      const { getAddress } = await import('@stellar/freighter-api');
      const res = await getAddress();
      return { address: res.address || '' };
    },
  };

  return kitInstance;
}
