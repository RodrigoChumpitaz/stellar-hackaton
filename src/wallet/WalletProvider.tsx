import { StrKey } from '@stellar/stellar-sdk';
import { getAddress as getFreighterAddress, getNetwork, isConnected as isFreighterInstalled, requestAccess, signTransaction as freighterSignTransaction } from '@stellar/freighter-api';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fundNewAccount, readAccount } from './account.js';
import { walletKit } from './kit.js';
import { TESTNET } from '../stellar.js';

const SESSION_KEY = 'stellar-runes.module-2.session';
type SessionKind = 'kit' | 'freighter';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  walletType: string | null;
  network: 'TESTNET';
  xlmBalance: number;
  sequenceNumber: string | null;
  isFunded: boolean;
  error: string | null;
  /** Indica si la extensión Freighter está disponible; la conexión sigue siendo multi-wallet. */
  isFreighterAvailable: boolean;
  connect: () => Promise<void>;
  connectFreighter: () => Promise<void>;
  disconnect: () => void;
  fundWithFriendbot: () => Promise<boolean>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletState | null>(null);

function errorMessage(reason: unknown) {
  const text = reason instanceof Error ? reason.message : String(reason);
  return /declined|rejected|denied/i.test(text)
    ? 'La solicitud fue rechazada en la billetera.'
    : text || 'No se pudo completar la operación de la billetera.';
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState(0);
  const [sequenceNumber, setSequenceNumber] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isFunded, setIsFunded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterAvailable, setFreighterAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAccount = useCallback(async (address: string, allowFunding: boolean) => {
    const initial = await readAccount(address);
    const account = initial.exists ? initial : allowFunding ? await fundNewAccount(address) : initial;
    setXlmBalance(account.xlmBalance);
    setIsFunded(account.xlmBalance > 0);
    setSequenceNumber(account.sequenceNumber);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true); setError(null);
    try {
      const { address } = await walletKit().authModal();
      if (!StrKey.isValidEd25519PublicKey(address)) throw new Error('La billetera no devolvió una dirección pública Stellar válida (G...).');
      const selected = walletKit().selectedModule;
      const network = await walletKit().getNetwork();
      if (network.networkPassphrase !== TESTNET.networkPassphrase) throw new Error('La billetera debe estar configurada en Stellar Testnet.');
      setPublicKey(address);
      setWalletType(selected.productName);
      localStorage.setItem(SESSION_KEY, 'kit');
      await refreshAccount(address, true);
    } catch (reason) {
      setPublicKey(null); setWalletType(null); setXlmBalance(0); setSequenceNumber(null); setIsFunded(false); setError(errorMessage(reason));
    } finally { setIsConnecting(false); }
  }, [refreshAccount]);

  const connectFreighter = useCallback(async () => {
    setIsConnecting(true); setError(null);
    try {
      const installed = await isFreighterInstalled();
      if (!installed.isConnected || installed.error) throw new Error('Freighter no está instalado. Instálalo desde https://www.freighter.app/');
      const granted = await requestAccess();
      if (granted.error || !StrKey.isValidEd25519PublicKey(granted.address)) throw new Error(granted.error?.message || 'Freighter no autorizó una dirección válida.');
      const network = await getNetwork();
      if (network.error || network.networkPassphrase !== TESTNET.networkPassphrase) throw new Error('Freighter debe estar configurado en Stellar Testnet.');
      setPublicKey(granted.address); setWalletType('Freighter'); localStorage.setItem(SESSION_KEY, 'freighter');
      await refreshAccount(granted.address, true);
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setIsConnecting(false); }
  }, [refreshAccount]);

  const disconnect = useCallback(() => {
    void walletKit().disconnect().catch(() => undefined);
    localStorage.removeItem(SESSION_KEY);
    setPublicKey(null); setWalletType(null); setXlmBalance(0); setSequenceNumber(null); setIsFunded(false); setError(null);
  }, []);

  const fundWithFriendbot = useCallback(async () => {
    if (!publicKey) { setError('Conecta una billetera antes de solicitar XLM de prueba.'); return false; }
    try { await refreshAccount(publicKey, true); return true; }
    catch (reason) { setError(errorMessage(reason)); return false; }
  }, [publicKey, refreshAccount]);

  const signTransaction = useCallback(async (xdr: string) => {
    if (!publicKey) throw new Error('Conecta una billetera antes de firmar una transacción.');
    if (walletType === 'Freighter') {
      const signed = await freighterSignTransaction(xdr, { networkPassphrase: TESTNET.networkPassphrase });
      if (signed.error) throw new Error(signed.error.message);
      return signed.signedTxXdr;
    }
    const { signedTxXdr } = await walletKit().signTransaction(xdr, {
      address: publicKey,
      networkPassphrase: TESTNET.networkPassphrase,
    });
    return signedTxXdr;
  }, [publicKey]);

  useEffect(() => {
    void isFreighterInstalled().then(({ isConnected, error: freighterError }) => {
      setFreighterAvailable(Boolean(isConnected && !freighterError));
    }).catch(() => setFreighterAvailable(false));

    const sessionKind = localStorage.getItem(SESSION_KEY) as SessionKind | null;
    if (!sessionKind) return;
    if (sessionKind === 'freighter') {
      void getFreighterAddress().then(async ({ address, error: addressError }) => {
        if (addressError || !StrKey.isValidEd25519PublicKey(address)) throw new Error('No hay una sesión autorizada de Freighter.');
        const network = await getNetwork();
        if (network.error || network.networkPassphrase !== TESTNET.networkPassphrase) throw new Error('Freighter no está en Testnet.');
        setPublicKey(address); setWalletType('Freighter'); await refreshAccount(address, false);
      }).catch(() => localStorage.removeItem(SESSION_KEY));
      return;
    }
    void walletKit().fetchAddress().then(async ({ address }) => {
      if (!StrKey.isValidEd25519PublicKey(address)) return;
      setPublicKey(address); setWalletType(walletKit().selectedModule.productName);
      await refreshAccount(address, false);
    }).catch(() => localStorage.removeItem(SESSION_KEY));
  }, [refreshAccount]);

  const value = useMemo<WalletState>(() => ({
    isConnected: publicKey !== null, isConnecting, publicKey, walletType, network: 'TESTNET',
    xlmBalance, sequenceNumber, isFunded, error, isFreighterAvailable, connect, connectFreighter, disconnect,
    fundWithFriendbot, signTransaction,
  }), [publicKey, isConnecting, walletType, xlmBalance, sequenceNumber, isFunded, error, isFreighterAvailable, connect, connectFreighter, disconnect, fundWithFriendbot, signTransaction]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet debe usarse dentro de <WalletProvider>.');
  return context;
}
