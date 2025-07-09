import { ADMIN_PRIVATE_KEY, NETWORK_URL } from '../config';
import { HttpClient, ThorClient, VeChainPrivateKeySigner, VeChainProvider } from '@vechain/sdk-network';
import { JusCatABI } from '@utils/const';
import { JUSCAT_SOL_ABI, JUSCAT_PASSPORT_ABI, config } from '@repo/config-contract';

// Use reliable testnet URLs based on VeChain documentation
// Multiple RPC endpoints for fallback
const TESTNET_URLS = [
  "https://testnet.vechain.org",
  "https://node-testnet.vechain.energy", 
  "https://testnet.vecha.in"
];

// Use the first URL as primary
const httpClient = new HttpClient(TESTNET_URLS[0]);

// Initialize Thor client with HTTP client
export const thor = new ThorClient(httpClient, {
  isPollingEnabled: false
});

// Create signer with admin private key
const signer = new VeChainPrivateKeySigner(
  Buffer.from(ADMIN_PRIVATE_KEY), 
  new VeChainProvider(thor)
);

// Function to try different RPC URLs if one fails
export async function tryWithFallbackRPC<T>(fn: () => Promise<T>): Promise<T> {
  let lastError;
  
  // Try with each URL
  for (const url of TESTNET_URLS) {
    try {
      // Update the HTTP client URL
      (httpClient as any).baseURL = url;
      console.log(`[DEBUG] Trying with RPC URL: ${url}`);
      
      // Try the function
      return await fn();
    } catch (error) {
      console.log(`[DEBUG] Failed with RPC URL ${url}: ${error.message}`);
      lastError = error;
      // Continue to next URL
    }
  }
  
  // If all URLs failed, throw the last error
  throw lastError;
}

// Load JusCat contract using 'as any' to bypass type checking
export const jusCatContract = thor.contracts.load(
  config.CONTRACT_ADDRESS,
  JUSCAT_SOL_ABI as any,
  signer,
);

// Load JusCatPassport contract if address is available in config
export const jusCatPassportContract = config.PASSPORT_ADDRESS 
  ? thor.contracts.load(
      config.PASSPORT_ADDRESS,
      JUSCAT_PASSPORT_ABI as any, // Use 'as any' to bypass type checking
      signer,
    )
  : null;
