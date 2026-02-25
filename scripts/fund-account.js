#!/usr/bin/env node

// Fund the geth test account from the Foundry default account
// Usage: node fund-account.js <rpc-url> <recipient-address>

const { ethers } = require('ethers');

const FUNDRY_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
  const rpcUrl = process.argv[2] || 'http://127.0.0.1:18080';
  const recipient = process.argv[3] || '0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab';
  const amount = process.argv[4] || '1000'; // ETH

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(FUNDRY_PRIVATE_KEY, provider);

  console.log(`Sending ${amount} ETH to ${recipient}...`);

  const tx = await wallet.sendTransaction({
    to: recipient,
    value: ethers.parseEther(amount)
  });

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();
  console.log('Transaction confirmed!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
