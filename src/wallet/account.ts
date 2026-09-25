import { NotFoundError } from '@stellar/stellar-sdk';
import { horizon, TESTNET } from '../stellar';

export type AccountSnapshot = { exists: boolean; xlmBalance: number; sequenceNumber: string | null };

export async function readAccount(address: string): Promise<AccountSnapshot> {
  try {
    const account = await horizon.loadAccount(address);
    const native = account.balances.find((balance) => balance.asset_type === 'native');
    return { exists: true, xlmBalance: Number(native?.balance ?? '0'), sequenceNumber: account.sequence };
  } catch (error) {
    if (error instanceof NotFoundError || (error as { response?: { status?: number } }).response?.status === 404) {
      return { exists: false, xlmBalance: 0, sequenceNumber: null };
    }
    throw error;
  }
}

/** Friendbot sólo está disponible en Testnet y nunca recibe una clave privada. */
export async function fundNewAccount(address: string): Promise<AccountSnapshot> {
  const response = await fetch(`${TESTNET.friendbotUrl}?addr=${encodeURIComponent(address)}`);
  if (!response.ok) throw new Error('Friendbot no pudo fondear la cuenta de Testnet.');

  // Friendbot se confirma en ledger de forma asíncrona; reintentamos la lectura acotadamente.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const snapshot = await readAccount(address);
    if (snapshot.exists) return snapshot;
    await new Promise<void>((resolve) => window.setTimeout(resolve, 1_200));
  }
  throw new Error('Friendbot aceptó la solicitud, pero la cuenta aún no fue confirmada en Testnet.');
}
