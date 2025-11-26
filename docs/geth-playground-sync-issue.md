# Geth Playground Sync Issue Summary

## Problem Statement

Geth fails to sync blocks in the playground environment due to architectural mismatch between local Geth client and containerized builder-playground setup.

## Root Cause Analysis

**Post-merge Ethereum requires consensus layer (beacon) for block validation.** Additionally, running Geth locally while playground components run in Docker creates networking isolation issues.

The playground environment runs:
- **Execution Layer (EL)**: Reth (containerized, block ~100+)
- **Consensus Layer (CL)**: Lighthouse beacon node + validator (containerized)
- **CL-Proxy**: Multiplexes requests between primary (Reth) and secondary (Geth) EL clients

## Approaches Tried & Failures

### 1. Local Geth Client Approach (Nov 25-26)
**Attempt:** Run Geth locally, connect to containerized playground via `--beacon.api` and `--bootnodes`.

**Issues Identified:**
- **Networking Isolation**: Local Geth cannot properly connect to containerized Reth P2P
- **Beacon API Incompatibility**: Geth light client sync requires Lighthouse endpoints that don't exist
- **CL-Proxy Connection**: CL-proxy tries to connect to `localhost:8547` (its own container) instead of external Geth

**Failures:**
- Beacon API: "blsync: checkpoint block is not available" (404 errors)
- P2P Connection: Peer drops immediately, `peercount=0`
- CL-Proxy: "dial tcp [::1]:8547: connect: connection refused"

### 2. Docker-based Geth Client Approach (Nov 26) ✅ **CURRENT SOLUTION**
**Attempt:** Containerize Geth in same Docker network as playground components.

**Progress Made:**
- ✅ **Custom Firehose Geth Image**: Built from `streamingfast/go-ethereum` branch `firehose-fh3.0`
- ✅ **Genesis Initialization**: Fixed mounting issues, now properly initializes with Chain ID 1337
- ✅ **Network Integration**: Dynamic network detection, proper service names
- ✅ **CL-Proxy Setup**: Configured for secondary EL client on port 8551
- ✅ **JWT Authentication**: Proper JWT secret mounting and validation

**Remaining Issues:**
- ⚠️ **Reth P2P Accessibility**: Reth configured with `--addr 127.0.0.1`, not listening on Docker network
- ⚠️ **CL-Proxy Target**: Still connecting to `localhost:8547` instead of `chain-geth-secondary:8551`
- ⚠️ **Beacon Consensus**: Geth shows "Post-merge network, but no beacon client seen"


## Current Status (Updated: Nov 26, 2025)

**Docker-based Geth Integration - Major Progress Made**

- ✅ **Architecture Fixed**: Moved from local Geth to containerized setup
- ✅ **Genesis Initialization**: Working correctly (Chain ID 1337 confirmed)
- ✅ **Firehose Geth**: Custom build from streamingfast/go-ethereum running
- ✅ **Network Connectivity**: Geth container properly joined playground network
- ✅ **CL-Proxy Integration**: Secondary EL configured for port 8551
- ⚠️ **P2P Connectivity**: Blocked by Reth's `--addr 127.0.0.1` configuration
- ⚠️ **CL-Proxy Routing**: Still pointing to wrong target (`localhost:8547`)
- ⚠️ **Beacon Consensus**: Geth cannot reach beacon client in container network

### Latest Investigation Results

#### Docker Network Analysis
- **Network Detection**: ✅ Dynamic playground network detection working
- **Container IPs**: ✅ Geth can resolve Reth container IP (172.21.0.2)
- **JWT Mounting**: ✅ Fixed file vs directory mounting issues
- **Genesis Loading**: ✅ Custom playground genesis properly initialized

#### Connectivity Issues Identified
- **Reth P2P**: Configured with `--addr 127.0.0.1`, not accessible from Docker network
- **CL-Proxy Target**: Hardcoded to `localhost:8547` instead of Geth service
- **Beacon API**: Geth cannot reach `chain-beacon-1:3500` from container

#### Root Cause Analysis
**Configuration Issues in Playground Setup:**
1. Reth needs `--addr 0.0.0.0` to listen on Docker network interfaces
2. CL-proxy needs `--secondary-builder http://chain-geth-secondary:8551`
3. Beacon API may need service name resolution or port mapping fixes


### Coworker recommendation on what they did (it's in french)
Oui il faut avoir de peers pour syncer et cest possible qu'il y est pas de flags, admin.addPeer ca  peut fonctionner.
On fait souvent ca partir geth et partir un autre process ensuite qui fait le addPeer, si tu regarde mes script optimism, tu va en voir un exemple,
a peu pres sur que je le fait la bas pour ajouter le
bon peer.
Pour Besu, un peu plus inquietant, mais je serais surpris qu'il supporte pas de partir d'un custom genesis.
Des fois cest une commande quil faut
rouler avant se syncer, style besu init.