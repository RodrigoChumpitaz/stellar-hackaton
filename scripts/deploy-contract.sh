#!/usr/bin/env bash
set -euo pipefail

# Ensure ~/.cargo/bin is in PATH for stellar CLI and cargo
export PATH="$HOME/.cargo/bin:$PATH"

if ! command -v stellar &> /dev/null; then
    echo "❌ Error: stellar CLI no está instalado o no se encuentra en el PATH."
    exit 1
fi

echo "📦 1. Compilando contrato Soroban Rust a WASM..."
stellar contract build --manifest-path contracts/forge_contract/Cargo.toml

WASM_PATH="contracts/forge_contract/target/wasm32v1-none/release/forge_contract.wasm"
if [ ! -f "$WASM_PATH" ]; then
    echo "❌ Error: No se encontró el binario WASM en $WASM_PATH"
    exit 1
fi

echo "🔑 2. Verificando identidades en Testnet..."
stellar keys generate deployer --network testnet --fund 2>/dev/null || echo "ℹ️ Identidad deployer ya existe."
stellar keys generate oracle --network testnet 2>/dev/null || echo "ℹ️ Identidad oracle ya existe."

ORACLE_ADDRESS=$(stellar keys address oracle)
echo "   Oracle Address: $ORACLE_ADDRESS"

echo "🚀 3. Desplegando contrato en Stellar Testnet..."
CONTRACT_ID=$(stellar contract deploy --wasm "$WASM_PATH" --source-account deployer --network testnet)
echo "   ✅ Contrato desplegado con ID: $CONTRACT_ID"

echo "⚙️ 4. Calculando parámetros de inicialización..."
HEX_DATA=$(python3 -c '
import base64, hashlib
passphrase = b"Test SDF Network ; September 2015"
net_id = hashlib.sha256(passphrase).hexdigest()
oracle_strkey = "'"$ORACLE_ADDRESS"'"
raw = base64.b32decode(oracle_strkey)
oracle_hex = raw[1:33].hex()
print(f"{oracle_hex} {net_id}")
')

ORACLE_HEX=$(echo "$HEX_DATA" | cut -d' ' -f1)
NETWORK_ID_HEX=$(echo "$HEX_DATA" | cut -d' ' -f2)

echo "   Oracle PubKey Hex: $ORACLE_HEX"
echo "   Network ID Hex:    $NETWORK_ID_HEX"

echo "🏁 5. Inicializando contrato en Testnet..."
stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source-account deployer \
    --network testnet \
    -- initialize \
    --admin deployer \
    --oracle_pubkey "$ORACLE_HEX" \
    --network_id "$NETWORK_ID_HEX"

echo "🎉 ¡Contrato inicializado exitosamente!"
echo ""
echo "=== RESUMEN DEL DESPLIEGUE (MÓDULO 5) ==="
echo "Contract ID:             $CONTRACT_ID"
echo "Admin Address:           $(stellar keys address deployer)"
echo "Oracle Address:          $ORACLE_ADDRESS"
echo "Stellar Expert Explorer: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo "Stellar Lab:             https://lab.stellar.org/r/testnet/contract/$CONTRACT_ID"
echo "========================================="

# Actualizar o agregar en .env.local si existe
ENV_LOCAL=".env.local"
if [ -f "$ENV_LOCAL" ]; then
    if grep -q "SOROBAN_CONTRACT_ADDRESS=" "$ENV_LOCAL"; then
        sed -i "s/^SOROBAN_CONTRACT_ADDRESS=.*/SOROBAN_CONTRACT_ADDRESS=$CONTRACT_ID/" "$ENV_LOCAL"
    else
        echo "SOROBAN_CONTRACT_ADDRESS=$CONTRACT_ID" >> "$ENV_LOCAL"
    fi
    echo "✅ SOROBAN_CONTRACT_ADDRESS actualizado en $ENV_LOCAL"
fi
