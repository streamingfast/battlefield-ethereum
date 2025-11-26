#!/bin/sh
set -e

# Always re-initialize for playground to ensure correct genesis
if [ -f /playground-chain/genesis.json ]; then
    echo "Re-initializing Geth with playground genesis..."
    echo "Running: /usr/local/bin/geth init --datadir=/data --state.scheme=hash /playground-chain/genesis.json"
    rm -rf /data/geth  # Clean any existing data
    /usr/local/bin/geth init --datadir=/data --state.scheme=hash /playground-chain/genesis.json
    echo "Genesis initialization completed"
else
    echo "ERROR: genesis.json not found, cannot initialize"
    exit 1
fi

# Note: Using beacon API for post-merge consensus

# Execute the main command
exec /usr/local/bin/geth "$@"
