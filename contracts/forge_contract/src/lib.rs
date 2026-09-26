#![no_std]

pub mod crypto;
pub mod errors;
pub mod events;
pub mod types;

#[cfg(test)]
mod test;

use crate::crypto::{build_canonical_payload, extract_address_bytes, verify_oracle_signature};
use crate::errors::Error;
use crate::events::{CardForged, OracleUpdated, StarterClaimed};
use crate::types::{CardData, CardStatsInput, DataKey};
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String};

const DAY_IN_LEDGERS: u32 = 17_280;
const BUMP_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS; // 30 días (~518,400 ledgers)
const BUMP_TO: u32 = 120 * DAY_IN_LEDGERS;       // 120 días (~2,073,600 ledgers)

#[contract]
pub struct ForgeContract;

#[contractimpl]
impl ForgeContract {
    /// Inicializa el contrato con el administrador, la clave pública del Oráculo y el network_id.
    /// Protegido contra ataques de reinicialización (Security Best Practice #3).
    pub fn initialize(
        env: Env,
        admin: Address,
        oracle_pubkey: BytesN<32>,
        network_id: BytesN<32>,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::OraclePubKey, &oracle_pubkey);
        env.storage().instance().set(&DataKey::NetworkId, &network_id);
        env.storage().instance().set(&DataKey::NextTokenId, &1000u64);

        env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);

        Ok(())
    }

    /// Actualiza la clave pública del Oráculo. Solo el administrador almacenado puede ejecutarlo.
    pub fn set_oracle(env: Env, new_oracle_pubkey: BytesN<32>) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        admin.require_auth();

        env.storage().instance().set(&DataKey::OraclePubKey, &new_oracle_pubkey);
        env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);

        OracleUpdated { admin }.publish(&env);

        Ok(())
    }

    /// Retorna la clave pública activa del Oráculo.
    pub fn get_oracle(env: Env) -> Result<BytesN<32>, Error> {
        env.storage()
            .instance()
            .get(&DataKey::OraclePubKey)
            .ok_or(Error::NotInitialized)
    }

    /// Retorna la dirección del administrador.
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    /// Reclama el mazo inicial on-chain (8 cartas comunes base, 2 por cada elemento).
    /// Cada dirección solo puede reclamarlo una única vez.
    pub fn claim_starter(env: Env, caller: Address) -> Result<(), Error> {
        caller.require_auth();

        if env.storage().persistent().has(&DataKey::ClaimedStarter(caller.clone())) {
            return Err(Error::StarterAlreadyClaimed);
        }

        let mut next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(1000u64);

        let zero_hash = BytesN::from_array(&env, &[0u8; 32]);

        // Catálogo canónico de 8 cartas iniciales
        let starter_templates: [(&str, u32, u32, u32, u32, &str); 8] = [
            ("Pyromancer Initiate", 1, 1, 3, 2, "cards/fire-1.svg"),
            ("Ember Sprite", 1, 1, 4, 1, "cards/fire-2.svg"),
            ("Tidal Apprentice", 2, 1, 2, 4, "cards/water-1.svg"),
            ("Mist Weaver", 2, 1, 1, 5, "cards/water-2.svg"),
            ("Stone Shaper", 3, 1, 3, 4, "cards/earth-1.svg"),
            ("Granite Golem", 3, 1, 2, 6, "cards/earth-2.svg"),
            ("Zephyr Adept", 4, 1, 4, 2, "cards/air-1.svg"),
            ("Gale Falcon", 4, 1, 5, 1, "cards/air-2.svg"),
        ];

        for (name, element, rarity, atk, def, uri) in starter_templates.iter() {
            let card = CardData {
                owner: caller.clone(),
                token_id: next_id,
                name: String::from_str(&env, name),
                element: *element,
                rarity: *rarity,
                atk: *atk,
                def: *def,
                metadata_uri: String::from_str(&env, uri),
                stats_hash: zero_hash.clone(),
            };

            env.storage().persistent().set(&DataKey::Card(next_id), &card);
            env.storage().persistent().extend_ttl(&DataKey::Card(next_id), BUMP_THRESHOLD, BUMP_TO);

            next_id = next_id.checked_add(1).ok_or(Error::InvalidStats)?;
        }

        env.storage().instance().set(&DataKey::NextTokenId, &next_id);
        env.storage().persistent().set(&DataKey::ClaimedStarter(caller.clone()), &true);
        env.storage().persistent().extend_ttl(&DataKey::ClaimedStarter(caller.clone()), BUMP_THRESHOLD, BUMP_TO);
        env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);

        StarterClaimed {
            caller,
            count: 8,
        }.publish(&env);

        Ok(())
    }

    /// Verifica si un jugador ya reclamó su pack inicial.
    pub fn has_claimed(env: Env, player: Address) -> bool {
        env.storage().persistent().has(&DataKey::ClaimedStarter(player))
    }

    /// Consulta una carta específica por su token_id on-chain.
    pub fn get_card(env: Env, token_id: u64) -> Result<CardData, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Card(token_id))
            .ok_or(Error::CardNotFound)
    }

    /// Método atómico indivisible de forja:
    /// 1. caller.require_auth()
    /// 2. Valida propiedad y unicidad de cartas
    /// 3. Valida anti-replay con nonce
    /// 4. Reconstruye el payload binario canónico de 160 bytes y verifica la firma Ed25519 del Oráculo
    /// 5. Quema atómica (storage().persistent().remove()) de Card A y Card B
    /// 6. Acuñación atómica (storage().persistent().set()) de la nueva carta híbrida
    /// 7. Extensión proactiva de TTL
    /// 8. Emisión del evento on-chain CardForged
    #[allow(clippy::too_many_arguments)]
    pub fn forge(
        env: Env,
        caller: Address,
        card_a: u64,
        card_b: u64,
        new_token_id: u64,
        stats: CardStatsInput,
        signature: BytesN<64>,
        nonce: u64,
    ) -> Result<(), Error> {
        // 1. Autorización obligatoria del jugador
        caller.require_auth();

        // 2. Comprobaciones de sanidad de inputs
        if card_a == card_b {
            return Err(Error::IdenticalCards);
        }
        if stats.atk == 0 || stats.def == 0 {
            return Err(Error::InvalidStats);
        }

        // 3. Comprobación anti-replay del nonce
        if env.storage().persistent().has(&DataKey::UsedNonce(nonce)) {
            return Err(Error::NonceAlreadyUsed);
        }

        // 4. Verificación de existencia y pertenencia de las dos cartas
        let card_a_data: CardData = env
            .storage()
            .persistent()
            .get(&DataKey::Card(card_a))
            .ok_or(Error::CardNotFound)?;

        if card_a_data.owner != caller {
            return Err(Error::NotCardOwner);
        }

        let card_b_data: CardData = env
            .storage()
            .persistent()
            .get(&DataKey::Card(card_b))
            .ok_or(Error::CardNotFound)?;

        if card_b_data.owner != caller {
            return Err(Error::NotCardOwner);
        }

        if env.storage().persistent().has(&DataKey::Card(new_token_id)) {
            return Err(Error::CardAlreadyExists);
        }

        // 5. Carga de parámetros del sistema y decodificación de direcciones a 32 bytes
        let network_id: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::NetworkId)
            .ok_or(Error::NotInitialized)?;

        let oracle_pubkey: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::OraclePubKey)
            .ok_or(Error::NotInitialized)?;

        let contract_address = env.current_contract_address();
        let contract_bytes = extract_address_bytes(&contract_address)?;
        let player_bytes = extract_address_bytes(&caller)?;

        // 6. Reconstrucción canónica exacta de los 152 bytes (Módulo 4 y Módulo 5 coordinados)
        let payload = build_canonical_payload(
            &env,
            &network_id,
            &contract_bytes,
            &player_bytes,
            card_a,
            card_b,
            new_token_id,
            &stats.stats_hash,
            nonce,
        );

        // 7. Validación criptográfica de la firma del Oráculo
        verify_oracle_signature(&env, &oracle_pubkey, &payload, &signature)?;

        // 8. Quema atómica (Burn) de Card A y Card B
        env.storage().persistent().remove(&DataKey::Card(card_a));
        env.storage().persistent().remove(&DataKey::Card(card_b));

        // 9. Acuñación atómica (Mint) de la nueva carta híbrida a favor del caller
        let new_card = CardData {
            owner: caller.clone(),
            token_id: new_token_id,
            name: stats.name,
            element: stats.element,
            rarity: stats.rarity,
            atk: stats.atk,
            def: stats.def,
            metadata_uri: stats.metadata_uri,
            stats_hash: stats.stats_hash,
        };

        env.storage().persistent().set(&DataKey::Card(new_token_id), &new_card);
        env.storage().persistent().extend_ttl(&DataKey::Card(new_token_id), BUMP_THRESHOLD, BUMP_TO);

        // 10. Registrar nonce para anular repeticiones
        env.storage().persistent().set(&DataKey::UsedNonce(nonce), &true);
        env.storage().persistent().extend_ttl(&DataKey::UsedNonce(nonce), BUMP_THRESHOLD, BUMP_TO);

        // 11. Refrescar TTL de instance
        env.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_TO);

        // 12. Emisión del evento on-chain CardForged
        CardForged {
            caller,
            new_token_id,
            card_a,
            card_b,
            element: stats.element,
            rarity: stats.rarity,
            atk: stats.atk,
            def: stats.def,
        }.publish(&env);

        Ok(())
    }
}
