use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    CardNotFound = 4,
    NotCardOwner = 5,
    IdenticalCards = 6,
    NonceAlreadyUsed = 7,
    InvalidSignature = 8,
    StarterAlreadyClaimed = 9,
    CardAlreadyExists = 10,
    InvalidStats = 11,
    AddressPayloadError = 12,
}
