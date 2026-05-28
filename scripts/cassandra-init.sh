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
# By default Cassandra binds rpc_address to localhost, so other Railway services
# (the app) cannot reach port 9042 across the internal network.
# The CASSANDRA_RPC_ADDRESS env var (set on the Railway service) is the clean way
# to override this — the official docker-entrypoint.sh reads it. This sed is a
# belt-and-suspenders fallback in case the env var isn't set.
if [ -z "$CASSANDRA_RPC_ADDRESS" ]; then
    if grep -q "^rpc_address:" "$YAML" 2>/dev/null; then
        sed -i 's/^rpc_address:.*/rpc_address: 0.0.0.0/' "$YAML"
        echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (patched)"
    elif grep -q "^# rpc_address:" "$YAML" 2>/dev/null; then
        sed -i 's/^# rpc_address:.*/rpc_address: 0.0.0.0/' "$YAML"
        echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (was commented, patched)"
    else
        echo "rpc_address: 0.0.0.0" >> "$YAML"
        echo "[CASSANDRA-INIT] rpc_address: 0.0.0.0 (appended)"
    fi
else
    echo "[CASSANDRA-INIT] CASSANDRA_RPC_ADDRESS=$CASSANDRA_RPC_ADDRESS (env var present, skipping sed)"
fi

echo "[CASSANDRA-INIT] Done. Handing off to Cassandra entrypoint..."

# Hand off to the official Docker entrypoint (handles CASSANDRA_* env vars,
# data dir init, etc.) then starts cassandra with -R (allow root) and -f (foreground).
exec /usr/local/bin/docker-entrypoint.sh "$@"
