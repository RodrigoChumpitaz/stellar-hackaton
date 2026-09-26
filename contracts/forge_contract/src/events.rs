use soroban_sdk::{contractevent, Address};

#[contractevent]
pub struct CardForged {
    #[topic]
    pub caller: Address,
    #[topic]
    pub new_token_id: u64,
    pub card_a: u64,
    pub card_b: u64,
    pub element: u32,
    pub rarity: u32,
    pub atk: u32,
    pub def: u32,
}

#[contractevent]
pub struct StarterClaimed {
    #[topic]
    pub caller: Address,
    pub count: u32,
}

#[contractevent]
pub struct OracleUpdated {
    #[topic]
    pub admin: Address,
}
