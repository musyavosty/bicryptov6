#!/bin/bash
set -e

YAML=/etc/cassandra/cassandra.yaml

echo "[CASSANDRA-INIT] Patching cassandra.yaml before startup..."

# ── Fix 1: Enable materialized views ─────────────────────────────────────────
# Cassandra 4.1 ships with materialized views disabled. The app requires them.
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

# ── Fix 2: Use rpc_interface: eth0 to bind CQL to the container's real IP ────
#
# APPROACH: rpc_interface: eth0 is better than rpc_address: 0.0.0.0 because:
#   - rpc_address: 0.0.0.0 requires broadcast_rpc_address to be a real IP
#   - broadcast_rpc_address can't be set statically (we don't know the IP at deploy time)
#   - rpc_interface: eth0 binds CQL to whatever IP eth0 has — no broadcast addr needed
#
# OVERRIDE CASSANDRA_RPC_ADDRESS: if the Railway env var CASSANDRA_RPC_ADDRESS is
# set to 0.0.0.0 (which triggers the crash), we neutralize it here so the
# docker-entrypoint.sh doesn't re-set rpc_address: 0.0.0.0 in the yaml.
unset CASSANDRA_RPC_ADDRESS

# Ensure rpc_address is commented out and rpc_interface: eth0 is present.
# (The Dockerfile already does this at build time; this is belt-and-suspenders.)
if grep -q "^rpc_address:" "$YAML" 2>/dev/null; then
    sed -i 's/^rpc_address:.*$/# rpc_address: disabled (using rpc_interface)/' "$YAML"
    echo "[CASSANDRA-INIT] rpc_address: commented out"
fi
if grep -q "^rpc_interface:" "$YAML" 2>/dev/null; then
    echo "[CASSANDRA-INIT] rpc_interface already set: $(grep '^rpc_interface:' $YAML)"
else
    echo "rpc_interface: eth0" >> "$YAML"
    echo "[CASSANDRA-INIT] rpc_interface: eth0 (appended)"
fi

echo "[CASSANDRA-INIT] Done. Handing off to Cassandra entrypoint..."
echo "[CASSANDRA-INIT] rpc_interface line: $(grep '^rpc_interface:' $YAML || echo 'NOT FOUND')"
echo "[CASSANDRA-INIT] materialized_views line: $(grep '^materialized_views_enabled:' $YAML || echo 'NOT FOUND')"

# Hand off to the official Docker entrypoint (handles data dir init, etc.)
exec /usr/local/bin/docker-entrypoint.sh "$@"
