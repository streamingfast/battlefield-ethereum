#!/usr/bin/env node

const { ethers } = require('ethers');

const RPC_URL = 'http://127.0.0.1:18080';
const FOUNDRY_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const GETH_TEST_ACCOUNT = '0x821b55d8abe79bc98f05eb675fdc50dfe796b7ab';
const FUNDING_AMOUNT = ethers.parseEther('10000');

async function fundAccount() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(FOUNDRY_PRIVATE_KEY, provider);

    console.log(`Sending ${ethers.formatEther(FUNDING_AMOUNT)} ETH from ${wallet.address} to ${GETH_TEST_ACCOUNT}...`);

    const tx = await wallet.sendTransaction({
      to: GETH_TEST_ACCOUNT,
      value: FUNDING_AMOUNT,
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log('Waiting for confirmation...');

    await tx.wait();
    console.log('Transaction confirmed!');

    const balance = await provider.getBalance(GETH_TEST_ACCOUNT);
    console.log(`Geth test account balance: ${ethers.formatEther(balance)} ETH`);

    process.exit(0);
  } catch (error) {
    console.error('Error funding account:', error.message);
    process.exit(1);
  }
}

fundAccount();
