#!/bin/bash
set -e

YAML=/etc/cassandra/cassandra.yaml

echo "[CASSANDRA-INIT] Patching cassandra.yaml before startup..."

# ── Fix 1: Enable materialized views ─────────────────────────────────────────
# Cassandra 4.1 ships with materialized views disabled (commented out).
# The app's ecosystem extension requires them to create orderbook/candle tables.
if grep -q "^# materialized_views_enabled:" "$YAML" 2>/dev/null; then
    sed -i 's/^# materialized_views_enabled:.*/materialized_views_enabled: true/' "$YAML"
    echo "[CASSANDRA-INIT] materialized_views_enabled: true (was commented out)"
elif grep -q "^materialized_views_enabled:" "$YAML" 2>/dev/null; then
    sed -i 's/^materialized_views_enabled:.*/materialized_views_enabled: true/' "$YAML"
    echo "[CASSANDRA-INIT] materialized_views_enabled: true (was set to false)"
else
    echo "materialized_views_enabled: true" >> "$YAML"
    echo "[CASSANDRA-INIT] materialized_views_enabled: true (appended)"
fi

# ── Fix 2: Bind CQL to all interfaces ────────────────────────────────────────
# ALWAYS patch rpc_address unconditionally — do NOT rely on CASSANDRA_RPC_ADDRESS
# env var alone. The cassandra:4.1 Docker entrypoint does not reliably honor it
# (confirmed: Cassandra still showed 127.0.0.1:9042 with env var set).
# Belt-and-suspenders: sed the yaml directly AND force-export the env var so
# docker-entrypoint.sh also sees it.
if grep -q "^rpc_address:" "$YAML" 2>/dev/null; then
    sed -i 's/^rpc_address:.*/rpc_address: 0.0.0.0/' "$YAML"
    echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (patched in yaml)"
elif grep -q "^# rpc_address:" "$YAML" 2>/dev/null; then
    sed -i 's/^# rpc_address:.*/rpc_address: 0.0.0.0/' "$YAML"
    echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (was commented, patched)"
else
    echo "rpc_address: 0.0.0.0" >> "$YAML"
    echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (appended)"
fi

# Force env var so docker-entrypoint also uses it (belt + suspenders)
export CASSANDRA_RPC_ADDRESS=0.0.0.0

echo "[CASSANDRA-INIT] Done. Handing off to Cassandra entrypoint..."

# Hand off to the official Docker entrypoint (handles data dir init, etc.)
exec /usr/local/bin/docker-entrypoint.sh "$@"
