/**
 * Ejecuta esto UNA sola vez para generar el par de claves del oráculo.
 * Uso: npx tsx scripts/generate-oracle-keypair.ts
 *
 * La SECRET KEY va a tu .env.local como ORACLE_SECRET_KEY (nunca a git).
 * La PUBLIC KEY se la pasas a quien implemente el Módulo 5 (Soroban),
 * porque el contrato necesita guardarla en DataKey::OracleKey para
 * poder verificar las firmas con ed25519_verify().
 */
import { Keypair } from "@stellar/stellar-sdk";

const oracleKeypair = Keypair.random();

console.log("=== ORACLE KEYPAIR (guarda esto de forma segura) ===");
console.log("PUBLIC KEY  (para el contrato Soroban):", oracleKeypair.publicKey());
console.log("SECRET KEY  (para .env.local, NUNCA a git):", oracleKeypair.secret());
console.log("======================================================");