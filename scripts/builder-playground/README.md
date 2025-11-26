# Builder Playground with Firehose Geth

This directory contains Docker setup for running a complete L1 environment with both Reth (primary) and Firehose Geth (secondary) execution clients, connected to a Lighthouse beacon node and validator.

## Architecture

- **Beacon Node**: Lighthouse (port 3500)
- **Primary EL**: Reth (port 8545)
- **Secondary EL**: Firehose Geth (port 8547)
- **CL Proxy**: Routes requests between primary and secondary ELs
- **MEV Boost**: Block builder infrastructure

## Files

- `Dockerfile`: Builds the custom Firehose Geth image
- `docker-compose.geth.yml`: Alternative compose setup (not used by default)
- `start-geth.sh`: Script to start Geth container connected to playground
- `build-geth.sh`: Script to build the Geth Docker image
- `run_playground_devnet.sh`: Modified playground starter that builds Geth image
- `wrapped_geth_playground.sh`: Original local Geth runner (kept for reference)

## Usage

### 1. Start the Complete Environment

```bash
./run_playground_devnet.sh
```

This will:
- Build the Firehose Geth Docker image (first run only)
- Start the playground with Reth as primary EL
- Start Geth as secondary EL connected to the same network

### 2. Manual Build (if needed)

```bash
./build-geth.sh
```

### 3. Manual Start (alternative)

```bash
# Start playground first
./run_playground_devnet.sh

# In another terminal, start Geth
./start-geth.sh
```

## Networking

- All containers run on the playground's Docker network (dynamically detected)
- Geth connects to Reth via IP address for P2P sync
- Uses EL-only sync (no beacon API)
- Host ports: Reth (8545), Geth (8547), Beacon (3500)

## Firehose Features

The custom Geth build includes:
- Firehose tracing capabilities
- Enhanced debugging and introspection
- StreamingFast protocol support

## Troubleshooting

### Geth Won't Connect
- Ensure playground is fully started first
- Check that Reth is responding on port 8545
- Verify Docker network connectivity

### Build Issues
- Ensure Docker has sufficient resources
- Check Go version compatibility (1.21+)
- Verify git access to StreamingFast repo

### Port Conflicts
- Default ports: Reth (8545), Geth (8547), Beacon (3500)
- Modify port mappings in `start-geth.sh` if needed
