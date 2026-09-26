use soroban_sdk::{
    address_payload::AddressPayload, Address, Bytes, BytesN, Env,
};
use crate::errors::Error;

pub fn extract_address_bytes(address: &Address) -> Result<BytesN<32>, Error> {
    match address.to_payload() {
        Some(AddressPayload::AccountIdPublicKeyEd25519(bytes)) => Ok(bytes),
        Some(AddressPayload::ContractIdHash(bytes)) => Ok(bytes),
        None => Err(Error::AddressPayloadError),
    }
}

#[allow(clippy::too_many_arguments)]
pub fn build_canonical_payload(
    env: &Env,
    network_id: &BytesN<32>,
    contract_id: &BytesN<32>,
    player_id: &BytesN<32>,
    card_a: u64,
    card_b: u64,
    new_token_id: u64,
    stats_hash: &BytesN<32>,
    nonce: u64,
) -> Bytes {
    let mut payload = Bytes::new(env);

    // 1. network_id (32 bytes)
    let net_bytes: Bytes = network_id.clone().into();
    payload.append(&net_bytes);

    // 2. contract_id (32 bytes)
    let contract_bytes: Bytes = contract_id.clone().into();
    payload.append(&contract_bytes);

    // 3. player_id (32 bytes)
    let player_bytes: Bytes = player_id.clone().into();
    payload.append(&player_bytes);

    // 4. card_a (8 bytes Big-Endian)
    payload.extend_from_array(&card_a.to_be_bytes());

    // 5. card_b (8 bytes Big-Endian)
    payload.extend_from_array(&card_b.to_be_bytes());

    // 6. new_token_id (8 bytes Big-Endian)
    payload.extend_from_array(&new_token_id.to_be_bytes());

    // 7. stats_hash (32 bytes)
    let stats_bytes: Bytes = stats_hash.clone().into();
    payload.append(&stats_bytes);

    // 8. nonce (8 bytes Big-Endian)
    payload.extend_from_array(&nonce.to_be_bytes());

    payload
}

pub fn verify_oracle_signature(
    env: &Env,
    oracle_pubkey: &BytesN<32>,
    payload: &Bytes,
    signature: &BytesN<64>,
) -> Result<(), Error> {
    // Reconstruye el hash SHA-256 de los 152 bytes canónicos
    let payload_hash = env.crypto().sha256(payload);
    let msg: Bytes = payload_hash.into();

    env.crypto().ed25519_verify(
        oracle_pubkey,
        &msg,
        signature,
    );

    Ok(())
}
