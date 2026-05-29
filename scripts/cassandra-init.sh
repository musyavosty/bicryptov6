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

# ── Fix 2: Set rpc/listen addresses to the container's real IP ───────────────
#
# WHY THIS IS NEEDED:
#   - cassandra:4.1 docker-entrypoint.sh defaults CASSANDRA_RPC_ADDRESS to
#     '0.0.0.0' and ALWAYS writes "rpc_address: 0.0.0.0" into the yaml.
#   - rpc_address: 0.0.0.0 requires broadcast_rpc_address to be a real IP.
#   - broadcast_rpc_address can't be a static Railway env var (IP not known
#     at deploy time).
#   - rpc_interface: eth0 would conflict if rpc_address is also present.
#
# SOLUTION: resolve the container's real IP here, then export it as
# CASSANDRA_RPC_ADDRESS (and friends) so docker-entrypoint.sh writes the real
# IP into the yaml.  A concrete IP needs no broadcast_rpc_address at all.

ACTUAL_IP=""
ACTUAL_IP=$(hostname -i 2>/dev/null | awk '{print $1}')

# Fallback 1: read eth0 directly
if [ -z "$ACTUAL_IP" ] || [ "$ACTUAL_IP" = "0.0.0.0" ] || [ "$ACTUAL_IP" = "127.0.0.1" ]; then
    ACTUAL_IP=$(ip addr show eth0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
fi

# Fallback 2: routing table
if [ -z "$ACTUAL_IP" ] || [ "$ACTUAL_IP" = "0.0.0.0" ] || [ "$ACTUAL_IP" = "127.0.0.1" ]; then
    ACTUAL_IP=$(ip route get 1 2>/dev/null | grep -oP 'src \K\S+')
fi

# Fallback 3: first non-loopback IP from ip addr
if [ -z "$ACTUAL_IP" ] || [ "$ACTUAL_IP" = "0.0.0.0" ] || [ "$ACTUAL_IP" = "127.0.0.1" ]; then
    ACTUAL_IP=$(ip addr 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -1)
fi

if [ -n "$ACTUAL_IP" ] && [ "$ACTUAL_IP" != "0.0.0.0" ] && [ "$ACTUAL_IP" != "127.0.0.1" ]; then
    echo "[CASSANDRA-INIT] Detected container IP: $ACTUAL_IP"

    # Override any Railway env vars that might be set to 0.0.0.0.
    # docker-entrypoint.sh reads these and writes them into cassandra.yaml.
    export CASSANDRA_RPC_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_BROADCAST_RPC_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_LISTEN_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_BROADCAST_ADDRESS="$ACTUAL_IP"

    # Remove rpc_interface lines from yaml — rpc_interface and rpc_address
    # cannot coexist.  We're using rpc_address, so remove rpc_interface.
    sed -i '/^rpc_interface:/d' "$YAML"
    sed -i '/^# rpc_interface:/d' "$YAML"

    echo "[CASSANDRA-INIT] Exported CASSANDRA_RPC_ADDRESS=$ACTUAL_IP (docker-entrypoint.sh will write this into yaml)"
else
    # Last-resort fallback: can't determine real IP.
    # Use rpc_interface: eth0 and hope the docker-entrypoint.sh conflict can
    # be resolved by forcing CASSANDRA_RPC_ADDRESS to the localhost placeholder
    # that docker-entrypoint.sh won't override... actually we must prevent the
    # conflict: set CASSANDRA_RPC_ADDRESS to a dummy non-wildcard value so
    # docker-entrypoint.sh writes rpc_address:127.0.0.1 (a concrete IP),
    # which doesn't conflict with rpc_interface.
    # Note: this means CQL is only reachable locally — last resort only.
    echo "[CASSANDRA-INIT] WARNING: could not determine container IP (got: '$ACTUAL_IP')"
    echo "[CASSANDRA-INIT] Falling back to CASSANDRA_RPC_ADDRESS=127.0.0.1 — external CQL may not work!"
    export CASSANDRA_RPC_ADDRESS="127.0.0.1"
    unset CASSANDRA_BROADCAST_RPC_ADDRESS
    sed -i '/^rpc_interface:/d' "$YAML"
fi

echo "[CASSANDRA-INIT] Done. Handing off to Cassandra docker-entrypoint.sh..."

exec /usr/local/bin/docker-entrypoint.sh "$@"
