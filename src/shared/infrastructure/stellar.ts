import { Horizon, Networks, rpc } from '@stellar/stellar-sdk';

/** La red es inmutable en este módulo: no debe conectarse a Mainnet por error. */
export const TESTNET = {
  horizonUrl: 'https://horizon-testnet.stellar.org',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
  networkPassphrase: Networks.TESTNET,
} as const;

export const horizon = new Horizon.Server(TESTNET.horizonUrl);
export const sorobanRpc = new rpc.Server(TESTNET.rpcUrl);
