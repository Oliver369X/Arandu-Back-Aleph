import { ethers } from 'ethers';

export const ARANDU_CONFIG = {
  network: 'lisk-sepolia',
  chainId: 4202,
  rpcUrl: 'https://rpc.sepolia-api.lisk.com',
  explorerUrl: 'https://sepolia-blockscout.lisk.com',
  
  contracts: {
    ANDUToken: process.env.ANDU_TOKEN_ADDRESS || '0xc518353025E46b587e424c4aBa6b260E4dB21322',
    AranduRewards: process.env.ARANDU_REWARDS_ADDRESS || '0x401DFD0a403245a2111B9Dac127B2815feBB3dfA',
    AranduBadges: process.env.ARANDU_BADGES_ADDRESS || '0x0275c991DfE3339da93a5aecbB162BE4A9D152C4',
    AranduCertificates: process.env.ARANDU_CERTIFICATES_ADDRESS || '0x60d4525Fe706c4CE938A415b2B8bC2a7f8b2f64c',
    AranduResources: process.env.ARANDU_RESOURCES_ADDRESS || '0x49bcaF572905BC08cdE35d2658875a9BFA52838a',
    DataAnchor: process.env.DATA_ANCHOR_ADDRESS || '0x9aDb12a7448B32836b526D7942Cc441fF91a6d3D'
  }
};

// Blockchain provider and signer
export const provider = new ethers.JsonRpcProvider(ARANDU_CONFIG.rpcUrl);

// Initialize backend signer only if private key is provided
let backendSigner = null;
if (process.env.BACKEND_PRIVATE_KEY) {
  try {
    backendSigner = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
    console.log(`🔗 Connected to ${ARANDU_CONFIG.network}`);
    console.log(`📍 Backend address: ${backendSigner.address}`);
  } catch (error) {
    console.error('❌ Error initializing backend signer:', error.message);
  }
} else {
  console.warn('⚠️ BACKEND_PRIVATE_KEY not provided. Blockchain features will be limited.');
}

export { backendSigner };
