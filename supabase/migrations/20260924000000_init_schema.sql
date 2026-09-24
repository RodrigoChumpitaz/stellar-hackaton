-- Stellar Runes · Módulo 1: catálogo, inventario e historial de forjas.
-- La blockchain es la fuente de verdad; estas tablas son un read-model.
-- Solo el backend (secret key / service_role) escribe, y únicamente tras confirmar la tx on-chain.

-- ─── Enums ──────────────────────────────────────────────────────────────
CREATE TYPE card_element AS ENUM (
    'FIRE', 'WATER', 'EARTH', 'AIR',                          -- base
    'STEAM', 'MAGMA', 'LIGHTNING', 'NATURE', 'ICE', 'SAND',   -- híbridos
    'AETHER'                                                  -- híbrido + cualquiera
);
CREATE TYPE card_rarity AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE forge_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'EXPIRED');

-- Dirección pública Stellar (G + 55 caracteres base32).
CREATE DOMAIN stellar_address AS VARCHAR(56)
    CHECK (VALUE ~ '^G[A-Z2-7]{55}$');

-- Hash de transacción Stellar (32 bytes en hex).
CREATE DOMAIN stellar_tx_hash AS VARCHAR(64)
    CHECK (VALUE ~ '^[0-9a-f]{64}$');

-- ─── 1. Catálogo de cartas base (solo lectura para jugadores) ───────────
CREATE TABLE cards_catalog (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    element     card_element NOT NULL
                CHECK (element IN ('FIRE', 'WATER', 'EARTH', 'AIR')),
    rarity      card_rarity NOT NULL DEFAULT 'COMMON',
    base_atk    INTEGER NOT NULL CHECK (base_atk >= 0),
    base_def    INTEGER NOT NULL CHECK (base_def >= 0),
    image_url   TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Inventario: toda carta aquí existe on-chain ─────────────────────
CREATE TABLE user_cards (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id       BIGINT NOT NULL UNIQUE,         -- ID en el contrato Soroban
    player_address stellar_address NOT NULL,       -- dueño actual
    catalog_id     INTEGER REFERENCES cards_catalog(id) ON DELETE RESTRICT,
    is_forged      BOOLEAN NOT NULL DEFAULT FALSE,
    name           VARCHAR(120) NOT NULL,
    element        card_element NOT NULL,
    rarity         card_rarity NOT NULL DEFAULT 'COMMON',
    atk            INTEGER NOT NULL CHECK (atk >= 0),
    def            INTEGER NOT NULL CHECK (def >= 0),
    passive_skill  TEXT,
    lore           TEXT,
    image_url      TEXT NOT NULL,
    metadata_uri   TEXT,
    stats_hash     TEXT,                           -- hash firmado por el oráculo
    mint_tx_hash   stellar_tx_hash NOT NULL,
    is_burned      BOOLEAN NOT NULL DEFAULT FALSE,
    burned_at      TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Base ⇔ viene del catálogo; forjada ⇔ no.
    CONSTRAINT user_cards_origin_chk    CHECK (is_forged = (catalog_id IS NULL)),
    CONSTRAINT user_cards_forged_hash   CHECK (NOT is_forged OR stats_hash IS NOT NULL),
    CONSTRAINT user_cards_burned_at_chk CHECK (is_burned = (burned_at IS NOT NULL))
);

CREATE INDEX idx_user_cards_player ON user_cards (player_address) WHERE is_burned = FALSE;

-- ─── 3. Historial de forjas (también actúa como registro de nonces) ─────
-- El oráculo inserta la fila en PENDING al firmar; el pipeline la pasa a
-- CONFIRMED (creando la carta resultante) o FAILED/EXPIRED.
CREATE TABLE forge_history (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_address    stellar_address NOT NULL,
    parent_a_token_id BIGINT NOT NULL REFERENCES user_cards (token_id),
    parent_b_token_id BIGINT NOT NULL REFERENCES user_cards (token_id),
    new_token_id      BIGINT NOT NULL UNIQUE,
    result_card_id    UUID UNIQUE REFERENCES user_cards (id),
    generated_stats   JSONB NOT NULL,              -- salida validada de Gemini
    stats_hash        TEXT NOT NULL,
    nonce             TEXT NOT NULL UNIQUE,        -- anti-replay
    oracle_signature  TEXT NOT NULL,
    status            forge_status NOT NULL DEFAULT 'PENDING',
    tx_hash           stellar_tx_hash,
    expires_at        TIMESTAMPTZ NOT NULL,
    confirmed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT forge_distinct_parents CHECK (parent_a_token_id <> parent_b_token_id),
    CONSTRAINT forge_confirmed_chk CHECK (
        status <> 'CONFIRMED'
        OR (tx_hash IS NOT NULL AND result_card_id IS NOT NULL AND confirmed_at IS NOT NULL)
    )
);

CREATE INDEX idx_forge_history_player ON forge_history (player_address, created_at DESC);
CREATE INDEX idx_forge_history_pending ON forge_history (expires_at) WHERE status = 'PENDING';

-- ─── Row Level Security ─────────────────────────────────────────────────
-- Lectura pública (los datos on-chain ya son públicos). Sin políticas de
-- escritura: solo service_role, que omite RLS, puede insertar/actualizar.
ALTER TABLE cards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_catalog: public read" ON cards_catalog FOR SELECT USING (true);
CREATE POLICY "user_cards: public read"    ON user_cards    FOR SELECT USING (true);
CREATE POLICY "forge_history: public read" ON forge_history FOR SELECT USING (true);
