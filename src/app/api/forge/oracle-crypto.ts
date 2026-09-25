import { Keypair, StrKey, hash, Networks } from "@stellar/stellar-sdk";
import { createHash } from "node:crypto";
import type { CardStats } from "./schema";

/**
 * Convierte un u64 (como string o number) a 8 bytes big-endian,
 * igual que lo espera el contrato Rust al deserializar.
 */
function u64ToBytes(value: string | number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(value));
  return buf;
}

/**
 * StatsHash = SHA-256(name + atk + def + element + uri)
 * IMPORTANTE: este orden y formato deben coincidir EXACTO con lo que
 * el contrato Soroban recalcule (coordinar con Módulo 5 / Rust).
 */
function computeStatsHash(stats: CardStats, metadataUri: string): Buffer {
  const canonical = `${stats.name}|${stats.atk}|${stats.def}|${stats.element}|${metadataUri}`;
  return createHash("sha256").update(canonical, "utf8").digest();
}

interface BuildPayloadParams {
  networkPassphrase: string; // ej. Networks.TESTNET
  contractAddress: string; // C... (56 chars, contrato Soroban)
  playerAddress: string; // G... (56 chars)
  cardA_id: string | number; // u64 numérico (no el UUID de Supabase)
  cardB_id: string | number;
  newTokenId: string | number;
  stats: CardStats;
  metadataUri: string;
  nonce: string; // u64, ej. Date.now().toString()
}

/**
 * Arma el payload canónico de 152 bytes (32+32+32+8+8+8+32+8) y devuelve
 * su hash SHA-256 de 32 bytes: exactamente lo que se firma y lo que
 * Soroban debe reconstruir para verificar con ed25519_verify().
 */
export function buildCanonicalPayloadHash(params: BuildPayloadParams): Buffer {
  const networkId = hash(Buffer.from(params.networkPassphrase, "utf8")); // 32 bytes

  // Direcciones G.../C... decodificadas a su raw de 32 bytes
  const contractIdBytes = StrKey.decodeContract(params.contractAddress); // 32 bytes
  const playerIdBytes = StrKey.decodeEd25519PublicKey(params.playerAddress); // 32 bytes

  const statsHash = computeStatsHash(params.stats, params.metadataUri); // 32 bytes

  const payload = Buffer.concat([
    networkId,
    contractIdBytes,
    playerIdBytes,
    u64ToBytes(params.cardA_id),
    u64ToBytes(params.cardB_id),
    u64ToBytes(params.newTokenId),
    statsHash,
    u64ToBytes(params.nonce),
  ]);

  return Buffer.from(hash(payload)); // SHA-256 de 32 bytes -> esto es lo que se firma
}

/**
 * Firma el hash del payload con la clave privada del oráculo.
 * Devuelve la firma en hex (64 bytes -> 128 caracteres hex).
 */
export function signPayload(payloadHash: Buffer): { signatureHex: string; publicKey: string } {
  const secret = process.env.ORACLE_SECRET_KEY;
  if (!secret) {
    throw new Error("ORACLE_SECRET_KEY no está configurada en el entorno.");
  }
  const oracleKeypair = Keypair.fromSecret(secret);
  const signature = oracleKeypair.sign(payloadHash); // 64 bytes

  const signatureHex = Buffer.from(signature).toString("hex"); // <- el arreglo

  if (!/^[0-9a-f]{128}$/.test(signatureHex)) {
    throw new Error("La firma del oráculo no tiene formato hex de 128 caracteres.");
  }

  return {
    signatureHex,
    publicKey: oracleKeypair.publicKey(),
  };
}

export { Networks };