# Besu Dev Setup for Battlefield

This directory contains the setup for running Besu directly in battlefield testing environments.

## Overview

Besu is an Apache 2.0 licensed, MainNet compatible, Ethereum client written in Java. This setup provides a direct Besu client that can be used as an alternative to Geth for battlefield testing, using the StreamingFast Besu fork.

## Quick Start

### 1. Setup Java 21 (macOS only)

If you're on macOS and don't have Java 21 set up:

```bash
./setup_java_macos.sh
```

### 2. Build Besu from Source

```bash
./build_besu.sh
```

This will clone the StreamingFast Besu repository, build it, and install the complete distribution to `~/.battlefield-besu/`.

Make sure to add the binary to your PATH:
```bash
export PATH="$HOME/.battlefield-besu/bin:$PATH"
```

### 3. Run Besu Dev Node

```bash
# From battlefield-ethereum root directory
# Default (Cancun fork)
./scripts/run_besu_dev.sh

# Explicit Cancun fork
./scripts/run_besu_dev.sh --fork cancun

# Prague fork
./scripts/run_besu_dev.sh --fork prague
```

### 4. Run Battlefield Tests

```bash
pnpm test:fh3.0:geth-dev
```

The tests will connect to Besu on `http://127.0.0.1:8545` instead of Geth.

## Supported Forks

- **Cancun**: Latest production-ready Ethereum hard fork
- **Prague**: Upcoming hard fork with experimental features

## Files

- `genesis.cancun.json`: Genesis configuration for Cancun fork
- `genesis.prague.json`: Genesis configuration for Prague fork
- `build_besu.sh`: Script to build and install Besu from StreamingFast repository
- `setup_java_macos.sh`: Helper script to setup Java 21 on macOS

## Configuration

Besu runs with the following configuration:

- **RPC Port**: 8545 (matches battlefield expectations)
- **RPC APIs**: ETH, NET, WEB3, DEBUG, MINER
- **RPC WebSocket**: Enabled on port 8546
- **CORS Origins**: All origins allowed (`*`)
- **Mining**: Enabled with coinbase `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73`
- **Consensus**: PoW dev mode with ethash (fixed difficulty: 100)
- **Network**: Uses battlefield genesis files (Cancun or Prague)
- **Data Storage**: Temporary directory (created per run, cleaned up on exit)

## Troubleshooting

### Build Issues

- **Git not found**: Install git (`apt install git` on Ubuntu/Debian or `brew install git` on macOS)
- **Java not installed**: Besu requires Java 21 specifically (Java 22+ incompatible with Gradle 8.7)
  - Ubuntu/Debian: `sudo apt install openjdk-21-jdk`
  - macOS: `brew install openjdk@21 && export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"`
  - Windows: Download from https://adoptium.net/ (Temurin JDK 21)
- **Wrong Java version**: If you have multiple Java versions, ensure Java 21 is first in PATH
- **Build fails**: Check Java version with `java --version` and available memory
- **Permission denied**: Ensure you have write permissions in the build directory

### Runtime Issues

- **Port 8545 in use**: Stop other Ethereum clients
- **Binary not found**: Ensure Besu is in PATH or set `BESU_BINARY` environment variable
- **Genesis file missing**: Verify genesis files exist in this directory

### Test Issues

- **Tests can't connect**: Ensure Besu is running on port 8545
- **Genesis mismatch**: Verify using correct fork version
- **RPC errors**: Check Besu logs for configuration issues

## Advanced Usage

### Custom Genesis

To use a custom genesis file:

1. Place your genesis file in this directory as `genesis.<fork>.json`
2. The script will automatically use it when running with that fork version

### Custom Besu Binary

Set the `BESU_BINARY` environment variable to use a different Besu installation:

```bash
export BESU_BINARY="/path/to/custom/besu"
./scripts/run_besu_dev.sh --fork cancun
```

### Build Options

The build script supports custom repository and branch:

```bash
./build_besu.sh --repo https://github.com/your-org/besu.git --branch feature-branch
```

## Integration with Firehose

This Besu setup uses the StreamingFast Besu fork which includes Firehose tracer integration. The direct execution approach makes it easier to test and debug Firehose functionality compared to containerized setups.

## Related Documentation

- [Battlefield README](../../../README.md)
- [StreamingFast Besu Repository](https://github.com/streamingfast/besu)
- [Besu Documentation](https://besu.hyperledger.org/)
