#!/usr/bin/env sh

set -xe

# private key to deploy contracts
export PRIVATE_KEY=0x39d1bccba2e358cacfa04cf1335d602d6cc040f15f6a19c232d15c4c32d1c1a9
export MNEMONIC=0x39d1bccba2e358cacfa04cf1335d602d6cc040f15f6a19c232d15c4c32d1c1a9

# export heimdall id
export HEIMDALL_ID=heimdall-4052

export SERVER_PORT=9545

# cd matic contracts repo
#
# git clone https://github.com/0xPolygon/pos-contracts ## fix me: this was generated with the matic-cli devnet templating, not sure how to re-generate those
cd "$(dirname "$0")/pos-contracts"
npm install

echo "DEPLOYER_PRIVATE_KEY=$PRIVATE_KEY" >>.env
echo "HEIMDALL_ID='$HEIMDALL_ID'" >>.env

export PATH="$HOME/.foundry/bin:$PATH"

# bor contracts are deployed on child chain
forge script scripts/deployment-scripts/deployContracts.s.sol:DeploymentScript --rpc-url http://localhost:$SERVER_PORT --private-key $PRIVATE_KEY --broadcast

forge script scripts/deployment-scripts/drainStakeManager.s.sol:DrainStakeManagerDeployment --rpc-url http://localhost:$SERVER_PORT --private-key $PRIVATE_KEY --broadcast

forge script scripts/deployment-scripts/initializeState.s.sol:InitializeStateScript --rpc-url http://localhost:$SERVER_PORT --private-key $PRIVATE_KEY --broadcast
