import { StrKey } from '@stellar/stellar-sdk';
import { getAddress as getFreighterAddress, getNetwork, isConnected as isFreighterInstalled, requestAccess, signTransaction as freighterSignTransaction } from '@stellar/freighter-api';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fundNewAccount, readAccount } from './account';
import { walletKit } from './kit';
import { createPasskeyKit, type PasskeyConfig } from './passkeys';
import { TESTNET } from '../stellar';

const SESSION_KEY = 'stellar-runes.module-2.session';
type SessionKind = 'kit' | 'freighter' | 'passkey';

export interface WalletProviderProps {
  children: ReactNode;
  /** Configuración pública del despliegue Smart Account Kit. Omítela para desactivar Passkeys. */
  passkeyConfig?: PasskeyConfig;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  /** Dirección C... de una cuenta inteligente conectada con WebAuthn. */
  smartAccountId: string | null;
  walletType: string | null;
  network: 'TESTNET';
  xlmBalance: number;
  sequenceNumber: string | null;
  isFunded: boolean;
  error: string | null;
  /** Indica si la extensión Freighter está disponible; la conexión sigue siendo multi-wallet. */
  isFreighterAvailable: boolean;
  isPasskeyAvailable: boolean;
  connect: () => Promise<void>;
  connectFreighter: () => Promise<void>;
  connectPasskey: () => Promise<void>;
  disconnect: () => void;
  fundWithFriendbot: () => Promise<boolean>;
  signTransaction: (xdr: string) => Promise<string>;
  /** Firma, re-simula y envía una transacción Soroban de Smart Account Kit. */
  signAndSubmitPasskeyTransaction: (transaction: Parameters<ReturnType<typeof createPasskeyKit>['signAndSubmit']>[0]) => ReturnType<ReturnType<typeof createPasskeyKit>['signAndSubmit']>;
}

const WalletContext = createContext<WalletState | null>(null);

function errorMessage(reason: unknown) {
  const text = reason instanceof Error ? reason.message : String(reason);
  return /declined|rejected|denied/i.test(text)
    ? 'La solicitud fue rechazada en la billetera.'
    : text || 'No se pudo completar la operación de la billetera.';
}

export function WalletProvider({ children, passkeyConfig }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [smartAccountId, setSmartAccountId] = useState<string | null>(null);
  const [xlmBalance, setXlmBalance] = useState(0);
  const [sequenceNumber, setSequenceNumber] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isFunded, setIsFunded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterAvailable, setFreighterAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passkeyKitRef = useRef<ReturnType<typeof createPasskeyKit> | null>(null);

  const getPasskeyKit = useCallback(() => {
    if (!passkeyConfig) throw new Error('Passkeys requiere la configuración pública de Smart Account Kit.');
    if (!passkeyKitRef.current) passkeyKitRef.current = createPasskeyKit(passkeyConfig);
    return passkeyKitRef.current;
  }, [passkeyConfig]);

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
      setSmartAccountId(null);
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
      setSmartAccountId(null);
      await refreshAccount(granted.address, true);
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setIsConnecting(false); }
  }, [refreshAccount]);

  const connectPasskey = useCallback(async () => {
    setIsConnecting(true); setError(null);
    try {
      const result = await getPasskeyKit().connectWallet({ prompt: true });
      if (!result) throw new Error('No se encontró una cuenta inteligente asociada a esta Passkey.');
      setPublicKey(null); setSmartAccountId(result.contractId); setWalletType('Passkey');
      setXlmBalance(0); setSequenceNumber(null); setIsFunded(false);
      localStorage.setItem(SESSION_KEY, 'passkey');
    } catch (reason) {
      setError(errorMessage(reason));
    } finally { setIsConnecting(false); }
  }, [getPasskeyKit]);

  const disconnect = useCallback(() => {
    void walletKit().disconnect().catch(() => undefined);
    void passkeyKitRef.current?.disconnect().catch(() => undefined);
    localStorage.removeItem(SESSION_KEY);
    setPublicKey(null); setSmartAccountId(null); setWalletType(null); setXlmBalance(0); setSequenceNumber(null); setIsFunded(false); setError(null);
  }, []);

  const fundWithFriendbot = useCallback(async () => {
    if (!publicKey) { setError('Conecta una billetera antes de solicitar XLM de prueba.'); return false; }
    try { await refreshAccount(publicKey, true); return true; }
    catch (reason) { setError(errorMessage(reason)); return false; }
  }, [publicKey, refreshAccount]);

  const signTransaction = useCallback(async (xdr: string) => {
    if (smartAccountId) throw new Error('Las cuentas Passkey usan signAndSubmitPasskeyTransaction para re-simular y firmar autorizaciones Soroban.');
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
  }, [publicKey, smartAccountId, walletType]);

  const signAndSubmitPasskeyTransaction = useCallback(async (transaction: Parameters<ReturnType<typeof createPasskeyKit>['signAndSubmit']>[0]) => {
    if (!smartAccountId) throw new Error('Conecta una Passkey antes de firmar una transacción de cuenta inteligente.');
    return getPasskeyKit().signAndSubmit(transaction);
  }, [getPasskeyKit, smartAccountId]);

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
    if (sessionKind === 'passkey') {
      if (!passkeyConfig) { localStorage.removeItem(SESSION_KEY); return; }
      void getPasskeyKit().connectWallet().then((result) => {
        if (!result) { localStorage.removeItem(SESSION_KEY); return; }
        setPublicKey(null); setSmartAccountId(result.contractId); setWalletType('Passkey');
      }).catch(() => localStorage.removeItem(SESSION_KEY));
      return;
    }
    void walletKit().fetchAddress().then(async ({ address }: { address: string }) => {
      if (!StrKey.isValidEd25519PublicKey(address)) return;
      setPublicKey(address); setWalletType(walletKit().selectedModule.productName);
      await refreshAccount(address, false);
    }).catch(() => localStorage.removeItem(SESSION_KEY));
  }, [getPasskeyKit, passkeyConfig, refreshAccount]);

  const value = useMemo<WalletState>(() => ({
    isConnected: publicKey !== null || smartAccountId !== null, isConnecting, publicKey, smartAccountId, walletType, network: 'TESTNET',
    xlmBalance, sequenceNumber, isFunded, error, isFreighterAvailable, isPasskeyAvailable: Boolean(passkeyConfig), connect, connectFreighter, connectPasskey, disconnect,
    fundWithFriendbot, signTransaction, signAndSubmitPasskeyTransaction,
  }), [publicKey, smartAccountId, isConnecting, walletType, xlmBalance, sequenceNumber, isFunded, error, isFreighterAvailable, passkeyConfig, connect, connectFreighter, connectPasskey, disconnect, fundWithFriendbot, signTransaction, signAndSubmitPasskeyTransaction]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet debe usarse dentro de <WalletProvider>.');
  return context;
}
