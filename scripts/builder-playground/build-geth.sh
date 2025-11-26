#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building Firehose Geth Docker image..."
cd "$SCRIPT_DIR"

# Build the Docker image
docker build -t playground-geth .

echo "Firehose Geth image built successfully!"
echo "You can now run it with: ./start-geth.sh"
