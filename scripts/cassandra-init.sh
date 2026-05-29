#!/bin/bash
set -e

YAML=/etc/cassandra/cassandra.yaml

echo "[CASSANDRA-INIT] Patching cassandra.yaml before startup..."

# ── Fix 1: Enable materialized views ─────────────────────────────────────────
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

# ── Fix 2: Force conservative heap to prevent OOM kills ───────────────────────
#
# Railway containers have limited RAM. A 512M JVM heap + JVM overhead (~200MB)
# easily exceeds available container memory → silent OOM kill → crash loop.
# Force 128M max heap so Cassandra survives in constrained environments.
# Performance is reduced but stability is guaranteed.
export MAX_HEAP_SIZE="128M"
export HEAP_NEWSIZE="32M"
echo "[CASSANDRA-INIT] Heap forced to MAX_HEAP_SIZE=128M HEAP_NEWSIZE=32M (OOM prevention)"

# ── Fix 3: Wipe stale gossip/system state on every boot ──────────────────────
#
# Each Railway deploy may get a new container IP. Cassandra saves its old IP
# in the system keyspace gossip tables. On restart with a new IP, Cassandra
# tries to reconcile the ring state and can crash or get stuck in bootstrap.
#
# SAFE to wipe because:
#   - This is a single-node deployment (no cluster peers)
#   - The app recreates trading/futures keyspaces on every connect
#   - Only system-level metadata is cleared; user data in trading/ and futures/
#     subdirectories inside /var/lib/cassandra/data/ is NOT touched
#
DATA_DIR=/var/lib/cassandra

# Wipe gossip/token tables inside the system keyspace (NOT application data)
for SYS_TABLE in peers peers_v2 peer_events peer_events_v2 local; do
    rm -rf "${DATA_DIR}/data/system/${SYS_TABLE}-"* 2>/dev/null || true
done

# Wipe system_schema so Cassandra rebuilds it fresh (app recreates via CQL)
rm -rf "${DATA_DIR}/data/system_schema" 2>/dev/null || true

# Wipe commitlog and hints (safe on single-node; no replica to hint)
rm -rf "${DATA_DIR}/commitlog"/* 2>/dev/null || true
rm -rf "${DATA_DIR}/hints"/* 2>/dev/null || true
rm -rf "${DATA_DIR}/saved_caches"/* 2>/dev/null || true

echo "[CASSANDRA-INIT] Stale gossip/system state cleared (trading/futures data preserved)"

# ── Fix 4: Detect real IPv4 address and set rpc/listen addresses ──────────────
#
# Cassandra runs with -Djava.net.preferIPv4Stack=true so IPv6 addresses are
# rejected. Every detection method below filters to IPv4-only.
#
# The cassandra:4.1 docker-entrypoint.sh always writes rpc_address into the
# yaml (defaulting to 0.0.0.0 if CASSANDRA_RPC_ADDRESS is unset), which then
# requires broadcast_rpc_address = real IP.  By exporting the real IPv4 as
# CASSANDRA_RPC_ADDRESS we give the entrypoint a concrete IP that needs no
# broadcast_rpc_address and doesn't conflict with rpc_interface.

# Helper: true if $1 looks like a dotted-quad IPv4 address
is_ipv4() {
    echo "$1" | grep -qE '^([0-9]{1,3}\.){3}[0-9]{1,3}$'
}

ACTUAL_IP=""

# Method 1: hostname -i — may return multiple addrs or IPv6; take first IPv4
for addr in $(hostname -i 2>/dev/null); do
    if is_ipv4 "$addr" && [ "$addr" != "127.0.0.1" ]; then
        ACTUAL_IP="$addr"
        break
    fi
done

# Method 2: eth0 inet (IPv4 only via "inet " not "inet6 ")
if [ -z "$ACTUAL_IP" ]; then
    ACTUAL_IP=$(ip addr show eth0 2>/dev/null \
        | grep -w 'inet' \
        | awk '{print $2}' \
        | cut -d/ -f1 \
        | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' \
        | grep -v '^127\.' \
        | head -1)
fi

# Method 3: routing table — src IP for default route
if [ -z "$ACTUAL_IP" ]; then
    ACTUAL_IP=$(ip route get 1 2>/dev/null \
        | grep -oE 'src ([0-9]{1,3}\.){3}[0-9]{1,3}' \
        | awk '{print $2}' \
        | head -1)
fi

# Method 4: any non-loopback inet address
if [ -z "$ACTUAL_IP" ]; then
    ACTUAL_IP=$(ip addr 2>/dev/null \
        | grep -w 'inet' \
        | awk '{print $2}' \
        | cut -d/ -f1 \
        | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' \
        | grep -v '^127\.' \
        | head -1)
fi

if [ -n "$ACTUAL_IP" ]; then
    echo "[CASSANDRA-INIT] Detected IPv4: $ACTUAL_IP"
    export CASSANDRA_RPC_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_BROADCAST_RPC_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_LISTEN_ADDRESS="$ACTUAL_IP"
    export CASSANDRA_BROADCAST_ADDRESS="$ACTUAL_IP"
    sed -i '/^rpc_interface:/d' "$YAML"
    sed -i '/^# rpc_interface:/d' "$YAML"
    echo "[CASSANDRA-INIT] All CASSANDRA_*_ADDRESS env vars set to $ACTUAL_IP"
else
    echo "[CASSANDRA-INIT] WARNING: no IPv4 found — falling back to 127.0.0.1 (external CQL unreachable)"
    export CASSANDRA_RPC_ADDRESS="127.0.0.1"
    unset CASSANDRA_BROADCAST_RPC_ADDRESS
    sed -i '/^rpc_interface:/d' "$YAML"
fi

echo "[CASSANDRA-INIT] Done. Handing off to Cassandra docker-entrypoint.sh..."

exec /usr/local/bin/docker-entrypoint.sh "$@"
