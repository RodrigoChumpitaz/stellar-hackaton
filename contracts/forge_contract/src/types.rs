use soroban_sdk::{contracttype, Address, BytesN, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CardData {
    pub owner: Address,
    pub token_id: u64,
    pub name: String,
    pub element: u32,
    pub rarity: u32,
    pub atk: u32,
    pub def: u32,
    pub metadata_uri: String,
    pub stats_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CardStatsInput {
    pub name: String,
    pub element: u32,
    pub rarity: u32,
    pub atk: u32,
    pub def: u32,
    pub metadata_uri: String,
    pub stats_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    OraclePubKey,
    NetworkId,
    NextTokenId,
    Card(u64),
    ClaimedStarter(Address),
    UsedNonce(u64),
}
