#![cfg(test)]

use super::*;
use ed25519_dalek::{Signer, SigningKey};
use soroban_sdk::{
    testutils::Address as _,
    Address, BytesN, Env, String,
};

fn setup_test_env<'a>() -> (
    Env,
    ForgeContractClient<'a>,
    Address,
    SigningKey,
    BytesN<32>,
    BytesN<32>,
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(ForgeContract, ());
    let client = ForgeContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Llave privada y pública determinista para el test del oráculo
    let signing_key = SigningKey::from_bytes(&[7u8; 32]);
    let verifying_key = signing_key.verifying_key();
    let oracle_pubkey = BytesN::from_array(&env, &verifying_key.to_bytes());

    // Network ID simulado (hash SHA-256 de "Test SDF Network ; September 2015")
    let network_id = BytesN::from_array(&env, &[123u8; 32]);

    client.initialize(&admin, &oracle_pubkey, &network_id);

    (env, client, admin, signing_key, oracle_pubkey, network_id)
}

#[test]
fn test_initialize_and_admin() {
    let (env, client, admin, _signing_key, oracle_pubkey, network_id) = setup_test_env();

    // Comprueba getters
    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_oracle(), oracle_pubkey);

    // Intento de reinicializar debe fallar (Error::AlreadyInitialized = 1)
    let other_admin = Address::generate(&env);
    let res = client.try_initialize(&other_admin, &oracle_pubkey, &network_id);
    assert_eq!(res, Err(Ok(Error::AlreadyInitialized)));

    // Admin actualiza la clave pública del Oráculo
    let new_oracle_key = BytesN::from_array(&env, &[99u8; 32]);
    client.set_oracle(&new_oracle_key);
    assert_eq!(client.get_oracle(), new_oracle_key);
}

#[test]
fn test_claim_starter_success_and_duplicate_rejected() {
    let (env, client, _admin, _signing_key, _oracle_pubkey, _network_id) = setup_test_env();
    let player = Address::generate(&env);

    assert!(!client.has_claimed(&player));

    // Reclamo exitoso
    client.claim_starter(&player);
    assert!(client.has_claimed(&player));

    // Verificar que las 8 cartas fueron creadas on-chain
    for token_id in 1000u64..1008u64 {
        let card = client.get_card(&token_id);
        assert_eq!(card.owner, player);
        assert_eq!(card.token_id, token_id);
        assert!(card.atk > 0);
        assert!(card.def > 0);
    }

    // Segundo reclamo debe ser rechazado con StarterAlreadyClaimed (9)
    let res = client.try_claim_starter(&player);
    assert_eq!(res, Err(Ok(Error::StarterAlreadyClaimed)));
}

#[test]
fn test_forge_atomic_success() {
    let (env, client, _admin, signing_key, _oracle_pubkey, network_id) = setup_test_env();
    let player = Address::generate(&env);

    // 1. Jugador reclama mazo inicial (obtiene tokens 1000..1007)
    client.claim_starter(&player);

    let card_a = 1000u64;
    let card_b = 1001u64;
    let new_token_id = 2000u64;
    let nonce = 88888u64;

    let stats_hash = BytesN::from_array(&env, &[55u8; 32]);
    let stats = CardStatsInput {
        name: String::from_str(&env, "Inferno Drake"),
        element: 5, // STEAM
        rarity: 2,  // UNCOMMON
        atk: 7,
        def: 5,
        metadata_uri: String::from_str(&env, "cards/inferno-drake.svg"),
        stats_hash: stats_hash.clone(),
    };

    // 2. Reconstruir el payload canónico de 152 bytes igual que el Oráculo
    let contract_bytes = extract_address_bytes(&client.address).unwrap();
    let player_bytes = extract_address_bytes(&player).unwrap();

    let payload = build_canonical_payload(
        &env,
        &network_id,
        &contract_bytes,
        &player_bytes,
        card_a,
        card_b,
        new_token_id,
        &stats_hash,
        nonce,
    );

    // El payload canónico concatenado mide 160 bytes (32*4 + 8*4)
    assert_eq!(payload.len(), 160);

    // 3. Firmar el hash SHA-256 del payload de 152 bytes
    let payload_hash: BytesN<32> = env.crypto().sha256(&payload).into();
    let signature_dalek = signing_key.sign(&payload_hash.to_array());
    let signature = BytesN::from_array(&env, &signature_dalek.to_bytes());

    // 4. Invocar forja atómica
    client.forge(
        &player,
        &card_a,
        &card_b,
        &new_token_id,
        &stats,
        &signature,
        &nonce,
    );

    // 5. Validar quema (Burn) de cartas A y B
    assert_eq!(client.try_get_card(&card_a), Err(Ok(Error::CardNotFound)));
    assert_eq!(client.try_get_card(&card_b), Err(Ok(Error::CardNotFound)));

    // 6. Validar acuñación (Mint) de la nueva carta a favor del jugador
    let forged = client.get_card(&new_token_id);
    assert_eq!(forged.owner, player);
    assert_eq!(forged.token_id, new_token_id);
    assert_eq!(forged.name, String::from_str(&env, "Inferno Drake"));
    assert_eq!(forged.element, 5);
    assert_eq!(forged.rarity, 2);
    assert_eq!(forged.atk, 7);
    assert_eq!(forged.def, 5);
    assert_eq!(forged.stats_hash, stats_hash);
}

#[test]
fn test_forge_invalid_signature_rejected() {
    let (env, client, _admin, _signing_key, _oracle_pubkey, _network_id) = setup_test_env();
    let player = Address::generate(&env);
    client.claim_starter(&player);

    let card_a = 1000u64;
    let card_b = 1001u64;
    let new_token_id = 2000u64;
    let nonce = 99999u64;

    let stats = CardStatsInput {
        name: String::from_str(&env, "Fraudulent Card"),
        element: 1,
        rarity: 1,
        atk: 5,
        def: 5,
        metadata_uri: String::from_str(&env, "cards/fraud.svg"),
        stats_hash: BytesN::from_array(&env, &[1u8; 32]),
    };

    // Firma falsa / adulterada
    let fake_signature = BytesN::from_array(&env, &[0u8; 64]);

    // La invocación debe entrar en pánico por fallo de verificación criptográfica
    let res = client.try_forge(
        &player,
        &card_a,
        &card_b,
        &new_token_id,
        &stats,
        &fake_signature,
        &nonce,
    );
    assert!(res.is_err());
}

#[test]
fn test_forge_unauthorized_owner_rejected() {
    let (env, client, _admin, signing_key, _oracle_pubkey, network_id) = setup_test_env();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.claim_starter(&alice);

    let card_a = 1000u64; // pertenece a Alice
    let card_b = 1001u64; // pertenece a Alice
    let new_token_id = 2000u64;
    let nonce = 12345u64;

    let stats_hash = BytesN::from_array(&env, &[55u8; 32]);
    let stats = CardStatsInput {
        name: String::from_str(&env, "Inferno Drake"),
        element: 5,
        rarity: 2,
        atk: 7,
        def: 5,
        metadata_uri: String::from_str(&env, "cards/drake.svg"),
        stats_hash: stats_hash.clone(),
    };

    let contract_bytes = extract_address_bytes(&client.address).unwrap();
    let bob_bytes = extract_address_bytes(&bob).unwrap();

    let payload = build_canonical_payload(
        &env,
        &network_id,
        &contract_bytes,
        &bob_bytes,
        card_a,
        card_b,
        new_token_id,
        &stats_hash,
        nonce,
    );

    let payload_hash: BytesN<32> = env.crypto().sha256(&payload).into();
    let signature_dalek = signing_key.sign(&payload_hash.to_array());
    let signature = BytesN::from_array(&env, &signature_dalek.to_bytes());

    // Bob intenta forjar las cartas de Alice -> Error::NotCardOwner (5)
    let res = client.try_forge(
        &bob,
        &card_a,
        &card_b,
        &new_token_id,
        &stats,
        &signature,
        &nonce,
    );

    assert_eq!(res, Err(Ok(Error::NotCardOwner)));
}

#[test]
fn test_forge_identical_cards_rejected() {
    let (env, client, _admin, _signing_key, _oracle_pubkey, _network_id) = setup_test_env();
    let player = Address::generate(&env);
    client.claim_starter(&player);

    let stats = CardStatsInput {
        name: String::from_str(&env, "Identical Test"),
        element: 1,
        rarity: 1,
        atk: 5,
        def: 5,
        metadata_uri: String::from_str(&env, "cards/test.svg"),
        stats_hash: BytesN::from_array(&env, &[1u8; 32]),
    };

    let fake_signature = BytesN::from_array(&env, &[0u8; 64]);

    // Forjar la misma carta consigo misma -> Error::IdenticalCards (6)
    let res = client.try_forge(
        &player,
        &1000u64,
        &1000u64,
        &2000u64,
        &stats,
        &fake_signature,
        &1111u64,
    );

    assert_eq!(res, Err(Ok(Error::IdenticalCards)));
}

#[test]
fn test_forge_replay_attack_rejected() {
    let (env, client, _admin, signing_key, _oracle_pubkey, network_id) = setup_test_env();
    let player = Address::generate(&env);
    client.claim_starter(&player);

    let card_a = 1000u64;
    let card_b = 1001u64;
    let new_token_id = 2000u64;
    let nonce = 77777u64;

    let stats_hash = BytesN::from_array(&env, &[55u8; 32]);
    let stats = CardStatsInput {
        name: String::from_str(&env, "Inferno Drake"),
        element: 5,
        rarity: 2,
        atk: 7,
        def: 5,
        metadata_uri: String::from_str(&env, "cards/drake.svg"),
        stats_hash: stats_hash.clone(),
    };

    let contract_bytes = extract_address_bytes(&client.address).unwrap();
    let player_bytes = extract_address_bytes(&player).unwrap();

    let payload = build_canonical_payload(
        &env,
        &network_id,
        &contract_bytes,
        &player_bytes,
        card_a,
        card_b,
        new_token_id,
        &stats_hash,
        nonce,
    );

    let payload_hash: BytesN<32> = env.crypto().sha256(&payload).into();
    let signature_dalek = signing_key.sign(&payload_hash.to_array());
    let signature = BytesN::from_array(&env, &signature_dalek.to_bytes());

    // Primera forja exitosa
    client.forge(
        &player,
        &card_a,
        &card_b,
        &new_token_id,
        &stats,
        &signature,
        &nonce,
    );

    // Intento de reutilizar el mismo nonce -> Error::NonceAlreadyUsed (7)
    let res = client.try_forge(
        &player,
        &1002u64,
        &1003u64,
        &3000u64,
        &stats,
        &signature,
        &nonce,
    );

    assert_eq!(res, Err(Ok(Error::NonceAlreadyUsed)));
}
