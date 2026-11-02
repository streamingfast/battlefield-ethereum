# Monad Devnet Setup for Battlefield Testing

Before running the Monad battlefield tests, ensure you have a monad node configured. ([Monad docs](https://docs.monad.xyz/node-ops/full-node-installation))
## Configuration Files

This directory contains pre-configured files for running Monad devnet:

[For all docs related](https://docs.monad.xyz/node-ops/)
- **node/node.toml** - Node configuration (peer discovery, statesync settings)
- **node/forkpoint.toml** - Genesis configuration
- **node/validators.toml** - Validator set configuration
- **node/id-bls** - BLS identity key
- **node/id-secp** - SECP256k1 identity key
- **node/profile.json** - Seccomp security profile
- **compose.yaml** - Docker Compose configuration for Monad services
- **compose.prebuilt.yaml** - Docker image overrides for images
- **docker-compose.localnet-firehose.yml** - Firehose and Substreams infrastructure

### Configuration Origins

Configuration files can be obtained from:

Validators: `https://bucket.monadinfra.com/validators/devnet/validators.toml`
Forkpoint: `https://bucket.monadinfra.com/forkpoint/devnet/forkpoint.toml`

## Running Tests

Once setup is complete, run the Monad battlefield tests:

```bash
pnpm test:fh3.0:monad-dev
```

The script will:
1. Validate your environment and prerequisites
2. Start Monad devnet containers
3. Wait for Monad RPC to be ready
4. Wait for the event ring to be created
5. Start Firehose infrastructure
6. Run the battlefield test suite

## Docker Images

- **monad-execution**: `ghcr.io/streamingfast/monad-execution:73ef8ec`
- **monad-node**: `ghcr.io/streamingfast/monad-node:eede85a`
- **monad-rpc**: `ghcr.io/streamingfast/monad-rpc:eede85a`
