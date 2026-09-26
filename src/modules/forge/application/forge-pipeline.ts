/**
 * Módulo 6: Pipeline de Transacciones & Ensamblaje Soroban (Integración Total)
 * Bounded Context: Forge (Application Layer)
 * 
 * Implementa el patrón de oro de Soroban según .agents/skills/dapp/SKILL.md:
 * build -> simulateTransaction -> assembleTransaction -> sign -> sendTransaction -> pollTransaction -> sync
 */

import {
  rpc,
  TransactionBuilder,
  Networks,
  Operation,
  Address,
  nativeToScVal,
  xdr,
  hash,
} from "@stellar/stellar-sdk";
import type { Card } from "@/modules/cards/domain/types";
import { ELEMENT_TO_NUM, RARITY_TO_NUM } from "./forge-types";

export const TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_STELLAR_RUNES_CONTRACT_ID ||
  process.env.SOROBAN_CONTRACT_ADDRESS ||
  "CAXAZJAJXA4CU2GYK3TRIGGDZTOCJGNX2FFC7CZEITN2TG7IPGSX7NVD";

export interface OracleStats {
  name: string;
  element: string;
  rarity: string;
  atk: number;
  def: number;
  metadata_uri?: string;
  lore?: string | null;
  passive_skill?: string | null;
  stats_hash?: string;
}

export interface OracleForgePayload {
  success: boolean;
  newTokenId: string;
  stats: OracleStats;
  nonce: string;
  oraclePublicKey: string;
  oracleSignature: string;
}

export interface ForgePipelineSigner {
  signTransaction: (xdr: string) => Promise<string>;
}

export interface ForgePipelineOptions {
  playerAddress: string;
  cardA: Card;
  cardB: Card;
  signer: ForgePipelineSigner;
  contractId?: string;
  rpcUrl?: string;
  onProgress?: (step: string) => void;
  mockOracleData?: OracleForgePayload;
}

export interface ForgePipelineResult {
  txHash: string;
  newTokenId: number;
  newCard: Card;
  ledger: number;
}

/**
 * Calcula el hash canónico de 32 bytes de los atributos de la carta (Módulo 4 + Módulo 5).
 * SHA-256(name|atk|def|element|metadata_uri)
 */
export function computeCardStatsHash(
  name: string,
  atk: number,
  def: number,
  element: string,
  metadataUri: string
): Buffer {
  const canonical = `${name}|${atk}|${def}|${element}|${metadataUri}`;
  return Buffer.from(hash(Buffer.from(canonical, "utf8")));
}

/**
 * Mapea códigos numéricos de error de Soroban (definidos en contracts/forge_contract/src/errors.rs)
 * a mensajes claros en español para la interfaz de usuario.
 */
export function parseContractErrorCode(rawError: unknown): string {
  const text = rawError instanceof Error ? rawError.message : String(rawError);

  if (/Error\(Contract, #?1\)/i.test(text)) {
    return "El contrato ya ha sido inicializado.";
  }
  if (/Error\(Contract, #?2\)/i.test(text)) {
    return "El contrato de forja no está inicializado.";
  }
  if (/Error\(Contract, #?3\)/i.test(text)) {
    return "Operación no autorizada en el contrato.";
  }
  if (/Error\(Contract, #?4\)/i.test(text)) {
    return "Una de las cartas seleccionadas no existe en el ledger de Stellar Soroban.";
  }
  if (/Error\(Contract, #?5\)/i.test(text)) {
    return "No eres el propietario registrado en la blockchain para estas cartas.";
  }
  if (/Error\(Contract, #?6\)/i.test(text)) {
    return "No puedes fusionar una carta consigo misma.";
  }
  if (/Error\(Contract, #?7\)/i.test(text)) {
    return "El nonce de la forja ya fue utilizado o ha expirado. Genera una nueva forja.";
  }
  if (/Error\(Contract, #?8\)/i.test(text) || /ed25519_verify/i.test(text)) {
    return "Fallo en la validación criptográfica de la firma del Oráculo.";
  }
  if (/Error\(Contract, #?9\)/i.test(text)) {
    return "El mazo inicial ya fue reclamado para esta cuenta.";
  }
  if (/Error\(Contract, #?10\)/i.test(text)) {
    return "El identificador del token ya existe en la blockchain.";
  }
  if (/Error\(Contract, #?11\)/i.test(text)) {
    return "Los atributos de ataque o defensa son inválidos para la regla de forja.";
  }
  if (/declined|rejected|denied/i.test(text)) {
    return "La firma fue cancelada o rechazada en la billetera.";
  }

  return text || "Error desconocido al interactuar con el contrato Soroban.";
}

/**
 * Construye canónicamente los 7 argumentos ScVal esperados por ForgeContract::forge.
 */
export function buildContractArgs({
  playerAddress,
  cardA_Id,
  cardB_Id,
  newTokenId,
  stats,
  oracleSignature,
  nonce,
}: {
  playerAddress: string;
  cardA_Id: number | bigint | string;
  cardB_Id: number | bigint | string;
  newTokenId: number | bigint | string;
  stats: OracleStats;
  oracleSignature: string;
  nonce: number | bigint | string;
}): xdr.ScVal[] {
  const metadataUri = stats.metadata_uri || `local://cards/${encodeURIComponent(stats.name)}`;
  const elementNum = ELEMENT_TO_NUM[stats.element] ?? 1;
  const rarityNum = RARITY_TO_NUM[stats.rarity] ?? 1;

  const statsHashBuf = stats.stats_hash
    ? Buffer.from(stats.stats_hash.replace(/^0x/, ""), "hex")
    : computeCardStatsHash(stats.name, stats.atk, stats.def, stats.element, metadataUri);

  // Struct canónico CardStatsInput (ordenado alfabéticamente por claves de Soroban)
  const statsMap = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("atk"),
      val: nativeToScVal(Number(stats.atk), { type: "u32" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("def"),
      val: nativeToScVal(Number(stats.def), { type: "u32" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("element"),
      val: nativeToScVal(elementNum, { type: "u32" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("metadata_uri"),
      val: nativeToScVal(metadataUri, { type: "string" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("name"),
      val: nativeToScVal(stats.name, { type: "string" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("rarity"),
      val: nativeToScVal(rarityNum, { type: "u32" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("stats_hash"),
      val: nativeToScVal(statsHashBuf, { type: "bytes" }),
    }),
  ]);

  const sigBuf = Buffer.from(oracleSignature.replace(/^0x/, ""), "hex");

  return [
    new Address(playerAddress).toScVal(),
    nativeToScVal(BigInt(cardA_Id), { type: "u64" }),
    nativeToScVal(BigInt(cardB_Id), { type: "u64" }),
    nativeToScVal(BigInt(newTokenId), { type: "u64" }),
    statsMap,
    nativeToScVal(sigBuf, { type: "bytes" }),
    nativeToScVal(BigInt(nonce), { type: "u64" }),
  ];
}

/**
 * Sondeo asíncrono con backoff exponencial para confirmación de transacciones en Soroban RPC.
 */
export async function pollTransactionStatus(
  server: rpc.Server,
  hash: string,
  timeoutMs = 35000,
  initialIntervalMs = 1500
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const startTime = Date.now();
  let currentInterval = initialIntervalMs;

  while (Date.now() - startTime < timeoutMs) {
    const txResult = await server.getTransaction(hash);
    if (txResult.status === "SUCCESS") {
      return txResult as rpc.Api.GetSuccessfulTransactionResponse;
    }
    if (txResult.status === "FAILED") {
      throw new Error(`La transacción falló en el ledger de Soroban (${hash}).`);
    }

    await new Promise((resolve) => setTimeout(resolve, currentInterval));
    currentInterval = Math.min(currentInterval * 1.2, 3000);
  }

  throw new Error(`Timeout esperando confirmación en el ledger de Stellar (35s transcurridos).`);
}

/**
 * Ejecutor principal del Pipeline de Forja Atómica End-to-End.
 */
export async function executeForgePipeline({
  playerAddress,
  cardA,
  cardB,
  signer,
  contractId = CONTRACT_ID,
  rpcUrl = TESTNET_RPC_URL,
  onProgress = () => undefined,
  mockOracleData,
}: ForgePipelineOptions): Promise<ForgePipelineResult> {
  const server = new rpc.Server(rpcUrl);

  // ─────────────────────────────────────────────────────────────
  // FASE 1: OBTENCIÓN DE DATOS Y FIRMA DEL ORÁCULO
  // ─────────────────────────────────────────────────────────────
  onProgress("1/6 · Solicitando síntesis y firma criptográfica al Oráculo...");
  let oracleData: OracleForgePayload;

  if (mockOracleData) {
    oracleData = mockOracleData;
  } else {
    const oracleRes = await fetch("/api/forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerAddress,
        cardA_id: cardA.id,
        cardB_id: cardB.id,
      }),
    });

    if (!oracleRes.ok) {
      const errorJson = await oracleRes.json().catch(() => ({}));
      throw new Error(
        errorJson.error || `Error ${oracleRes.status} al consultar al Oráculo de Forja.`
      );
    }

    oracleData = await oracleRes.json();
  }

  const { newTokenId, stats, nonce, oracleSignature } = oracleData;
  const cardA_TokenId = cardA.token_id ?? (typeof cardA.id === "number" ? cardA.id : 1000);
  const cardB_TokenId = cardB.token_id ?? (typeof cardB.id === "number" ? cardB.id : 1001);

  // ─────────────────────────────────────────────────────────────
  // FASE 2: PREPARACIÓN Y SIMULACIÓN PRE-FLIGHT
  // ─────────────────────────────────────────────────────────────
  onProgress("2/6 · Consultando secuencia de cuenta en Stellar Testnet...");
  const account = await server.getAccount(playerAddress);

  const contractArgs = buildContractArgs({
    playerAddress,
    cardA_Id: cardA_TokenId,
    cardB_Id: cardB_TokenId,
    newTokenId,
    stats,
    oracleSignature,
    nonce,
  });

  const rawTx = new TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "forge",
        args: contractArgs,
      })
    )
    .setTimeout(180)
    .build();

  onProgress("3/6 · Simulando huella atómica de almacenamiento (Pre-flight)...");
  const sim = await server.simulateTransaction(rawTx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(parseContractErrorCode(sim.error));
  }

  // ─────────────────────────────────────────────────────────────
  // FASE 3: ENSAMBLAJE DE RECURSOS (FOOTPRINT & GAS)
  // ─────────────────────────────────────────────────────────────
  onProgress("4/6 · Ensamblando recursos y preparando firma de billetera...");
  const preparedTx = rpc.assembleTransaction(rawTx, sim).build();

  // ─────────────────────────────────────────────────────────────
  // FASE 4: FIRMA CRIPTOGRÁFICA CON LA BILLETERA
  // ─────────────────────────────────────────────────────────────
  onProgress("5/6 · Esperando autorización en tu billetera...");
  let signedXdr: string;
  try {
    signedXdr = await signer.signTransaction(preparedTx.toXDR());
  } catch (signErr) {
    throw new Error(parseContractErrorCode(signErr));
  }

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  // ─────────────────────────────────────────────────────────────
  // FASE 5: ENVÍO A TESTNET & POLLING ASÍNCRONO
  // ─────────────────────────────────────────────────────────────
  onProgress("6/6 · Enviando transacción y esperando validación en el ledger...");
  const sendRes = await server.sendTransaction(signedTx);

  if (sendRes.status === "ERROR") {
    throw new Error(
      `Fallo al emitir la transacción a Soroban RPC: ${JSON.stringify(sendRes.errorResult)}`
    );
  }

  const txResult = await pollTransactionStatus(server, sendRes.hash);

  // ─────────────────────────────────────────────────────────────
  // FASE 6: SINCRONIZACIÓN OFF-CHAIN (SUPABASE)
  // ─────────────────────────────────────────────────────────────
  let resultingCard: Card = {
    id: `forged-${newTokenId}-${Date.now()}`,
    token_id: Number(newTokenId),
    name: stats.name,
    element: stats.element as Card["element"],
    rarity: stats.rarity as Card["rarity"],
    atk: stats.atk,
    def: stats.def,
    image_url: stats.metadata_uri || "/cards/crystal-logo.png",
    description: stats.lore || stats.passive_skill || "",
    lore: stats.lore,
    passive_skill: stats.passive_skill,
  };

  try {
    const syncRes = await fetch("/api/sync-forge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash: sendRes.hash,
        playerAddress,
        cardA_id: String(cardA.id),
        cardB_id: String(cardB.id),
        parentA_tokenId: Number(cardA_TokenId),
        parentB_tokenId: Number(cardB_TokenId),
        newTokenId: Number(newTokenId),
        stats,
        nonce,
      }),
    });

    if (syncRes.ok) {
      const syncData = await syncRes.json();
      if (syncData?.card) {
        resultingCard = syncData.card;
      }
    }
  } catch (syncErr) {
    console.warn("Aviso: Sincronización off-chain secundaria diferida:", syncErr);
  }

  return {
    txHash: sendRes.hash,
    newTokenId: Number(newTokenId),
    newCard: resultingCard,
    ledger: txResult.ledger,
  };
}
